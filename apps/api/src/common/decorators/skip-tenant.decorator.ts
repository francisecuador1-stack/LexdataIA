import { SetMetadata } from '@nestjs/common';

export const SKIP_TENANT_KEY = 'skipTenantContext';
export const SkipTenantContext = () => SetMetadata(SKIP_TENANT_KEY, true);
