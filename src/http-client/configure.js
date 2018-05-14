/* @flow */
import type from '../type.js';
import classBuilder from '../class-builder.js';
import { type IConfigurator, default as createConfig } from './configurator.js';
import { type IFetch, FetchClient } from './fetch-client.js';

export default (configure: (configurator: IConfigurator) => void): IFetch => {
  if (type.undefined(fetch)) {
    throw new Error("Requires Fetch API implementation, but the current environment doesn't support it.");
  }
  const config: IConfigurator = createConfig();
  configure(config);

  if (config.mixins && config.mixins.length > 0) {
    let FetchWithMixins: Class<IFetch & any> = classBuilder(FetchClient).with.apply(null, config.mixins);
    return new FetchWithMixins(config);
  }

  return new FetchClient(config);
};