import {Control, control} from './Control';
import {Layers, layers} from './Control.Layers';
import {Zoom, zoom} from './Control.Zoom';
import {Scale, scale} from './Control.Scale';

Control.Layers = Layers;
Control.Zoom = Zoom;
Control.Scale = Scale;

control.layers = layers;
control.zoom = zoom;
control.scale = scale;

export {Control, control};
