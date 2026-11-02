import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { VpnService } from './vpn.service.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class VpnController {
  constructor(private readonly vpnService: VpnService) {}

  /** Returns the node's connect payload unchanged. */
  @Post('connect/:nodeId')
  @HttpCode(HttpStatus.OK)
  connect(
    @CurrentUserId() userId: string,
    @Param('nodeId', ParseUUIDPipe) nodeId: string,
  ) {
    return this.vpnService.connect(userId, nodeId);
  }

  @Post('disconnect/:nodeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  disconnect(
    @CurrentUserId() userId: string,
    @Param('nodeId', ParseUUIDPipe) nodeId: string,
  ) {
    return this.vpnService.disconnect(userId, nodeId);
  }
}
