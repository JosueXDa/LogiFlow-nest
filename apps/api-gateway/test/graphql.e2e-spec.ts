import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from '../src/constans';
import { of } from 'rxjs';

describe('GraphQL Module (e2e)', () => {
    let app: INestApplication;

    const mockPedidosService = {
        send: jest.fn((pattern, payload) => {
            if (pattern === 'find_all_pedidos') {
                return of([
                    { id: '1', clienteId: 'c1', destino: 'Norte', estado: 'EN_RUTA', repartidorId: 'r1', createdAt: new Date().toISOString() }
                ]);
            }
            if (pattern === 'get_pedido') {
                return of(
                    { id: '1', clienteId: 'c1', destino: 'Norte', estado: 'EN_RUTA', repartidorId: 'r1', createdAt: new Date().toISOString() }
                );
            }
            return of([]);
        }),
    };

    const mockFleetService = {
        send: jest.fn((pattern, payload) => {
            if (pattern.cmd === 'fleet.repartidor.findOne') {
                return of({ success: true, data: { nombre: 'Juan', vehiculo: { tipo: 'Moto' } } });
            }
            if (pattern.cmd === 'fleet.repartidor.findAll') {
                return of({
                    success: true, data: [
                        { id: 'r1', estado: 'DISPONIBLE' },
                        { id: 'r2', estado: 'EN_RUTA' }
                    ]
                });
            }
            return of({ success: false });
        }),
    };

    const mockBillingService = {
        send: jest.fn((pattern, payload) => {
            if (pattern.cmd === 'billing.obtener_factura_por_pedido') {
                return of({ success: true, data: { total: 10.5, estado: 'EMITIDA' } });
            }
            if (pattern.cmd === 'billing.reporte_diario') {
                return of({ success: true, data: { totalPedidos: 100, costoPromedioEntrega: 2.5, tasaCumplimiento: 99, ingresosTotales: 500 } });
            }
            return of({ success: false });
        }),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(MICROSERVICES_CLIENTS.PEDIDOS_SERVICE) // No sirve overrideProvider para ClientsModule TOKEN string, hay que ver como mockearlo
            // ClientsModule registers providers with the string token.
            // Override useValue
            .overrideProvider(MICROSERVICES_CLIENTS.PEDIDOS_SERVICE)
            .useValue(mockPedidosService)
            .overrideProvider(MICROSERVICES_CLIENTS.FLEET_SERVICE)
            .useValue(mockFleetService)
            .overrideProvider(MICROSERVICES_CLIENTS.BILLING_SERVICE)
            .useValue(mockBillingService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Query: PedidosEnZona', () => {
        return request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
          query PedidosEnZona {
            pedidos(filtro: { zonaId: "UIO-NORTE", estado: "EN_RUTA" }) {
              id
              estado
              repartidor {
                nombre
                vehiculo { tipo }
              }
              tiempoTranscurrido
            }
          }
        `,
            })
            .expect(200)
            .expect((res) => {
                const data = res.body.data.pedidos;
                expect(data).toHaveLength(1);
                expect(data[0].id).toBe('1');
                expect(data[0].repartidor.nombre).toBe('Juan');
            });
    });

    it('Query: ResumenFlota', () => {
        return request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
          query ResumenFlota {
            flotaActiva(zonaId: "UIO-NORTE") {
              total
              disponibles
              enRuta
            }
          }
        `,
            })
            .expect(200)
            .expect((res) => {
                const data = res.body.data.flotaActiva;
                expect(data.total).toBe(2);
                expect(data.disponibles).toBe(1);
                expect(data.enRuta).toBe(1);
            });
    });

    it('Query: ReporteGerencial', () => {
        return request(app.getHttpServer())
            .post('/graphql')
            .send({
                query: `
          query ReporteGerencial {
            kpiDiario(fecha: "2025-01-01") {
              totalPedidos
              ingresosTotales
            }
          }
        `,
            })
            .expect(200)
            .expect((res) => {
                const data = res.body.data.kpiDiario;
                expect(data.totalPedidos).toBe(100);
                expect(data.ingresosTotales).toBe(500);
            });
    });
});
