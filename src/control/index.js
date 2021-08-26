import {Control, control} from './Control';
import {Layers, layers} from './Control.Layers';
import {Zoom, zoom} from './Control.Zoom';

Control.Layers = Layers;
Control.Zoom = Zoom;

control.layers = layers;
control.zoom = zoom;

export {Control, control};
