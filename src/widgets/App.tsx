import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { tsx, storeNode } from 'esri/widgets/support/widget';
tsx;

import '../styles/widgets/App.css';

interface MapProperties extends __esri.WidgetProperties {
    view?: __esri.MapView | __esri.SceneView;
    errors?: string[];
}
const css = {
    root: 'app',
    loading: 'app--loading',
    map: 'app--map',
};

@subclass('app.widgets.App')
class App extends Widget {
    @property()
    status: 'loading' | 'complete' = 'loading';

    @property()
    errors: string[] = [];

    private _mapContainer?: HTMLDivElement;

    private _view?: __esri.MapView | __esri.SceneView;

    @property()
    get view(): undefined | __esri.MapView | __esri.SceneView {
        return this._view;
    }
    set view(view) {
        //console.debug('App.view', view);
        this._view = view;
        if (this._view) this._view.container = this._mapContainer as HTMLDivElement;
    }

    constructor(params: MapProperties = {}) {
        super();
        if (params.container) this.container = params.container;
        if (params.view) this.view = params.view;
        this.errors = params.errors || [];
    }

    render() {
        return (
            <div class={this.classes(css.root, this.status === 'loading' ? css.loading : undefined, 'esri-component')}>
                {this.errors.map((message) => (
                    <calcite-alert placement={'top'} color={'red'} icon={'exclamationMarkTriangle'} active>
                        <div slot="title">Error</div>
                        <div slot="message">{message}</div>
                    </calcite-alert>
                ))}
                <div class={this.classes(css.map)} bind={this} afterCreate={storeNode} data-node-ref="_mapContainer" />
            </div>
        );
    }
}

export default App;
