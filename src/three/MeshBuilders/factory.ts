import { Theme } from '@three';

import MeshBuilder, { Options } from './Abstract';
import SFMeshBuilder from './SF';
import TokyoMeshBuilder from './Tokyo';
import SpaceMeshBuilder from './Space';

export const meshBuilderFactory = (options: Options): MeshBuilder => {
  switch (options.theme) {
    case Theme.SF:
      return new SFMeshBuilder(options);
    case Theme.Tokyo:
      return new TokyoMeshBuilder(options);
    case Theme.Space:
      return new SpaceMeshBuilder(options);
  }
};
