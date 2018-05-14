/*  */
import type from '../type.js';
import classBuilder from '../class-builder.js';
import { default as createConfig } from './configurator.js';
import { FetchClient} from './fetch-client.js';

export default (configure) => {
  if (type.undefined(fetch)) {
    throw new Error("Requires Fetch API implementation, but the current environment doesn't support it.");
  }
  const config = createConfig();
  configure(config);

  if (config.mixins && config.mixins.length > 0) {
    let FetchWithMixins = classBuilder(FetchClient).with.apply(null, config.mixins);
    return new FetchWithMixins(config);
  }

  return new FetchClient(config);
};
