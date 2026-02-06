
import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from '../../src/pedidos/service/impl/pedidos.service';
import { InventoryService } from '../../../inventory-service/src/inventory/inventory.service';
import { InventoryEventsController } from '../../../inventory-service/src/inventory/inventory-events.controller';
import { PedidosController } from '../../src/pedidos/pedidos.controller';
import { Pedido } from '../../src/pedidos/entities/pedido.entity';
import { ItemPedido } from '../../src/pedidos/entities/item-pedido.entity';
import { Producto } from '../../../inventory-service/src/inventory/entities/product.entity';
import { ReservaStock, EstadoReserva } from '../../../inventory-service/src/inventory/entities/reserve-stock.entity';
import { PedidosRepository } from '../../src/pedidos/repository/pedidos.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { of } from 'rxjs';
import { PedidoEstado, TipoVehiculo } from '../../src/pedidos/entities/pedido.entity';
import { CreatePedidoDto } from '../../src/pedidos/dto/create-pedido.dto';

// Constants tokens
const PEDIDOS_EVENT_CLIENT = 'PEDIDOS_EVENT_CLIENT';
const INVENTORY_CLIENT = 'INVENTORY_CLIENT';
const INVENTORY_EVENT_CLIENT = 'INVENTORY_EVENT_CLIENT';

// Helper to create in-memory repository
class MockRepository<T> {
    private items: T[] = [];
    private idCounter = 1;

    create(dto: any) {
        return { ...dto, id: (this.idCounter++).toString() } as unknown as T;
    }

    async save(item: any) {
        const existingIndex = this.items.findIndex(i => (i as any).id === item.id);
        if (existingIndex > -1) {
            this.items[existingIndex] = item;
            return item;
        }
        if (!item.id) {
            item.id = (this.idCounter++).toString();
        }
        this.items.push(item);
        return item;
    }

    async findOne(options: any) {
        if (options.where && options.where.id) {
            return this.items.find(i => (i as any).id === options.where.id) || null;
        }
        if (options.where && options.where.sku) {
            return this.items.find(i => (i as any).sku === options.where.sku) || null;
        }
        return null;
    }

    async find(options: any) {
        if (options && options.where && options.where.pedidoId) {
            return this.items.filter(i => (i as any).pedidoId === options.where.pedidoId);
        }
        return this.items;
    }

    async remove(item: any) {
        this.items = this.items.filter(i => (i as any).id !== item.id);
        return item;
    }

    get manager() {
        return {
            transaction: async (cb: any) => {
                const mockManager = {
                    save: async (entity: any, item: any) => {
                        if (item instanceof Producto || item.sku) {
                            return await mockProductoRepo.save(item);
                        }
                        if (item instanceof ReservaStock || item.pedidoId) {
                            return await mockReservaRepo.save(item);
                        }
                        return item;
                    }
                };
                return await cb(mockManager);
            }
        }
    }
}

// Global instances for the mock manager to access
let mockProductoRepo: MockRepository<Producto>;
let mockReservaRepo: MockRepository<ReservaStock>;
let pendingPromises: Promise<any>[] = [];

describe('Pedidos <-> Inventory Integration', () => {
    let pedidosService: PedidosService;
    let inventoryService: InventoryService;
    let inventoryEventsController: InventoryEventsController;

    let mockEventClient: any;
    let mockInventoryClient: any;

    beforeEach(async () => {
        mockProductoRepo = new MockRepository<Producto>();
        mockReservaRepo = new MockRepository<ReservaStock>();
        pendingPromises = [];

        // Seed a product
        await mockProductoRepo.save({
            id: 'prod-1',
            sku: 'SKU-TEST',
            nombre: 'Producto Test',
            pesoKg: 1.5,
            stockTotal: 100,
            stockReservado: 0,
            stockDisponible: 100,
            reservas: []
        } as any);

        const mockPedidoTypeOrmRepo = new MockRepository<Pedido>();

        const pedidosRepositoryProvider = {
            provide: PedidosRepository,
            useValue: {
                createPedido: (data: any) => ({ ...data, id: 'ped-1' }),
                createItem: (data: any) => ({ ...data, id: 'item-' + Math.random() }),
                savePedido: async (pedido: Pedido) => {
                    return await mockPedidoTypeOrmRepo.save(pedido);
                },
                findPedidoById: async (id: string) => {
                    return await mockPedidoTypeOrmRepo.findOne({ where: { id } });
                },
                findAll: async () => []
            }
        };

        mockInventoryClient = {
            send: (pattern: string, data: any) => {
                if (pattern === 'get_product') {
                    return of(mockProductoRepo.findOne({ where: { id: data } }).then(p => {
                        if (!p) throw new Error('Not found');
                        return p;
                    }));
                }
                if (pattern === 'reserve_stock') {
                    return of(inventoryService.reserveStock(data));
                }
                return of(null);
            },
            emit: (pattern: string, data: any) => {
                if (pattern === 'pedido.cancelado') {
                    pendingPromises.push(inventoryEventsController.handlePedidoCancelado(data));
                }
                if (pattern === 'pedido.entregado') {
                    pendingPromises.push(inventoryEventsController.handlePedidoEntregado(data));
                }
            }
        };

        mockEventClient = {
            emit: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PedidosService,
                InventoryService,
                InventoryEventsController,
                pedidosRepositoryProvider,
                {
                    provide: 'PEDIDOS_EVENT_CLIENT',
                    useValue: mockEventClient
                },
                {
                    provide: 'INVENTORY_CLIENT',
                    useValue: mockInventoryClient
                },
                {
                    provide: 'INVENTORY_EVENT_CLIENT',
                    useValue: mockEventClient
                },
                {
                    provide: getRepositoryToken(Producto),
                    useValue: mockProductoRepo
                },
                {
                    provide: getRepositoryToken(ReservaStock),
                    useValue: mockReservaRepo
                }
            ],
        }).compile();

        pedidosService = module.get<PedidosService>(PedidosService);
        inventoryService = module.get<InventoryService>(InventoryService);
        inventoryEventsController = module.get<InventoryEventsController>(InventoryEventsController);
    });

    it('should reserve stock when creating an order', async () => {
        // Arrange
        const createDto: CreatePedidoDto = {
            clienteId: 'cliente-1',
            tipoVehiculo: 'MOTO' as any,
            origen: { lat: 0, lng: 0, direccion: 'Calle A' },
            destino: { lat: 0, lng: 0, direccion: 'Calle B' },
            items: [
                { productoId: 'prod-1', cantidad: 5 }
            ]
        };

        // Act
        const pedido = await pedidosService.createPedido(createDto);

        // Assert
        expect(pedido).toBeDefined();
        expect(pedido.estado).toBe(PedidoEstado.PENDIENTE);
        expect(pedido.items[0].reservaId).toBeDefined();

        // Verify Inventory State
        const producto = await mockProductoRepo.findOne({ where: { id: 'prod-1' } });
        expect(producto.stockReservado).toBe(5);

        // Check Reservation
        const reservas = await mockReservaRepo.find({ where: { pedidoId: pedido.id } });
        expect(reservas.length).toBe(1);
        expect(reservas[0].estado).toBe(EstadoReserva.PENDIENTE);
    });

    it('should return stock when cancelling an order', async () => {
        // Arrange: Create order first
        const createDto: CreatePedidoDto = {
            clienteId: 'cliente-1',
            tipoVehiculo: 'MOTO' as any,
            origen: { lat: 0, lng: 0, direccion: 'Calle A' },
            destino: { lat: 0, lng: 0, direccion: 'Calle B' },
            items: [{ productoId: 'prod-1', cantidad: 10 }]
        };
        const pedido = await pedidosService.createPedido(createDto);

        // Verify initial state
        let producto = await mockProductoRepo.findOne({ where: { id: 'prod-1' } });
        expect(producto.stockReservado).toBe(10);

        // Act: Cancel Order
        await pedidosService.cancelPedido(pedido.id, { reason: 'User changed mind' } as any);
        await Promise.all(pendingPromises); // Wait for async event handling

        // Assert
        const canceledPedido = await pedidosService.findPedidoById(pedido.id);
        expect(canceledPedido.estado).toBe(PedidoEstado.CANCELADO);

        // Check Inventory State
        producto = await mockProductoRepo.findOne({ where: { id: 'prod-1' } });
        expect(producto.stockReservado).toBe(0);

        const reservas = await mockReservaRepo.find({ where: { pedidoId: pedido.id } });
        expect(reservas[0].estado).toBe(EstadoReserva.CANCELADA);
    });

    it('should confirm stock when order is delivered', async () => {
        // Arrange
        const createDto: CreatePedidoDto = {
            clienteId: 'cliente-2',
            tipoVehiculo: 'MOTO' as any,
            origen: { lat: 0, lng: 0, direccion: 'Calle A' },
            destino: { lat: 0, lng: 0, direccion: 'Calle B' },
            items: [{ productoId: 'prod-1', cantidad: 20 }]
        };
        const pedido = await pedidosService.createPedido(createDto);

        // Verify initial
        let producto = await mockProductoRepo.findOne({ where: { id: 'prod-1' } });
        expect(producto.stockReservado).toBe(20);
        expect(producto.stockTotal).toBe(100);

        // Act: deliver order
        await pedidosService.updateEstado(pedido.id, { nuevoEstado: PedidoEstado.ENTREGADO });
        await Promise.all(pendingPromises); // Wait for async event handling

        // Assert
        producto = await mockProductoRepo.findOne({ where: { id: 'prod-1' } });
        expect(producto.stockTotal).toBe(80);
        expect(producto.stockReservado).toBe(0);

        const reservas = await mockReservaRepo.find({ where: { pedidoId: pedido.id } });
        expect(reservas[0].estado).toBe(EstadoReserva.CONFIRMADA);
    });
});
