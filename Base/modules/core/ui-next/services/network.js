import { createMemo } from '../../vendor/solid-js/dist/solid.js';

const isGameCenter = createMemo(() => Network.getLocalHostingPlatform() === HostingType.HOSTING_TYPE_GAMECENTER);

export { isGameCenter };
//# sourceMappingURL=network.js.map
