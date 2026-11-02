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
import { OptionalJwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { VpnService } from './vpn.service.js';

/** Token optional: requests without `Authorization` are anonymous. */
@Controller()
@UseGuards(OptionalJwtAuthGuard)
export class VpnController {
  constructor(private readonly vpnService: VpnService) {}

  /** Returns the node's connect payload unchanged. */
  @Post('connect/:nodeId')
  @HttpCode(HttpStatus.OK)
  connect(
    @CurrentUserId() userId: string | null,
    @Param('nodeId', ParseUUIDPipe) nodeId: string,
  ) {
    return this.vpnService.connect(userId, nodeId);
  }

  /**
   * `publicKey` is the peer key from the connect response, URL-encoded
   * (base64 contains `+`, `/`, `=`). Express decodes it before it gets here.
   */
  @Post('disconnect/:publicKey')
  @HttpCode(HttpStatus.NO_CONTENT)
  disconnect(
    @CurrentUserId() userId: string | null,
    @Param('publicKey') publicKey: string,
  ) {
    return this.vpnService.disconnect(userId, publicKey);
  }
}
