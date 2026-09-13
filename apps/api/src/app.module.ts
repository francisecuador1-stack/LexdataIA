import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ClientesModule } from './clientes/clientes.module';
import { CorpusModule } from './corpus/corpus.module';
import { Fase2Module } from './fase2/fase2.module';
import { Fase3Module } from './fase3/fase3.module';
import { Fase4Module } from './fase4/fase4.module';
import { Fase5Module } from './fase5/fase5.module';
import { Fase6Module } from './fase6/fase6.module';
import { Fase7Module } from './fase7/fase7.module';
import { CapacitacionesModule } from './capacitaciones/capacitaciones.module';
import { PortalModule } from './portal/portal.module';
import { EvidenciasModule } from './evidencias/evidencias.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ReportesModule } from './reportes/reportes.module';
import { AgenteModule } from './agente/agente.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    HealthModule,
    TenantsModule,
    ClientesModule,
    CorpusModule,
    Fase2Module,
    Fase3Module,
    Fase4Module,
    Fase5Module,
    Fase6Module,
    Fase7Module,
    CapacitacionesModule,
    PortalModule,
    EvidenciasModule,
    DocumentosModule,
    ReportesModule,
    AgenteModule,
    AuditModule,
  ],
  providers: [
    // Guard order matters: JWT → Roles → Tenant → Throttler
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // INV-1 / INV-11: wrap every authenticated request in a transaction
    // with SET LOCAL for RLS tenant isolation
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
  ],
})
export class AppModule {}
