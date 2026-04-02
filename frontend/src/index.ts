import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { Extension, ExtensionContext } from 'shared';
import PropertiesEditorPage from './PropertiesEditorPage.tsx';

class ServerPropertiesEditor extends Extension {
  public initialize(ctx: ExtensionContext): void {
    ctx.extensionRegistry.routes.addServerRoute({
      name: 'Properties',
      icon: faSliders,
      path: '/properties',
      element: PropertiesEditorPage,
      permission: 'files.read-content',
    });
  }
}

export default new ServerPropertiesEditor();
