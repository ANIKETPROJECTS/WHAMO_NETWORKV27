import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { memo } from 'react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';

// Element colors
const COLORS = {
  reservoir:  '#00008B',
  node:       '#3b82f6',
  junction:   '#8B0000',
  surgeTank:  '#C76E00',
  pump:       '#8B0000',
  checkValve: '#5C3317',
  turbine:    '#006400',
};

// Common handle styles
const HandleStyle = "w-2 h-2 border border-white opacity-0 group-hover:opacity-100 transition-opacity";

// Hook: returns true if this node has a node-order validation error
function useNodeOrderError(id: string) {
  return useNetworkStore(state => state.nodeOrderErrorIds.includes(id));
}

// Reusable circle node shell
function CircleNode({
  color,
  selected,
  hasOrderError,
  children,
}: {
  color: string;
  selected: boolean;
  hasOrderError: boolean;
  children: React.ReactNode;
}) {
  const borderColor = hasOrderError ? '#ef4444' : color;
  const ringStyle = hasOrderError
    ? { outline: '2px solid rgba(239,68,68,0.3)', outlineOffset: 2 }
    : selected
    ? { outline: `2px solid ${color}40`, outlineOffset: 2 }
    : {};

  return (
    <div
      className="w-9 h-9 rounded-full border-2 shadow-sm flex items-center justify-center transition-all relative group bg-white"
      style={{ borderColor, ...ringStyle }}
    >
      {children}
    </div>
  );
}

// Handles helper
function AllHandles({ color }: { color: string }) {
  const hs = clsx(HandleStyle);
  return (
    <>
      <Handle type="target" id="t-top"    position={Position.Top}    className={hs} style={{ background: color }} />
      <Handle type="source" id="s-top"    position={Position.Top}    className={hs} style={{ background: color }} />
      <Handle type="target" id="t-bottom" position={Position.Bottom} className={hs} style={{ background: color }} />
      <Handle type="source" id="s-bottom" position={Position.Bottom} className={hs} style={{ background: color }} />
      <Handle type="target" id="t-left"   position={Position.Left}   className={hs} style={{ background: color }} />
      <Handle type="source" id="s-left"   position={Position.Left}   className={hs} style={{ background: color }} />
      <Handle type="target" id="t-right"  position={Position.Right}  className={hs} style={{ background: color }} />
      <Handle type="source" id="s-right"  position={Position.Right}  className={hs} style={{ background: color }} />
    </>
  );
}

// Reservoir Node
export const ReservoirNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  const color = COLORS.reservoir;

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Reservoir Properties" />}>
      <CircleNode color={color} selected={selected} hasOrderError={hasOrderError}>
        <span className="text-[12px] font-bold text-black leading-none">{data.label as React.ReactNode}</span>
        <AllHandles color={color} />
      </CircleNode>
    </TooltipWrapper>
  );
});

// Basic Node (Simple Node)
export const SimpleNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  const color = COLORS.node;

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Node Properties" />}>
      <CircleNode color={color} selected={selected} hasOrderError={hasOrderError}>
        <span className="text-[12px] font-bold text-black leading-none">N{data.nodeNumber as React.ReactNode}</span>
        <AllHandles color={color} />
      </CircleNode>
    </TooltipWrapper>
  );
});

// Junction Node
export const JunctionNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  const color = COLORS.junction;

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Junction Properties" />}>
      <CircleNode color={color} selected={selected} hasOrderError={hasOrderError}>
        <span className="text-[12px] font-bold text-black leading-none">J{data.nodeNumber as React.ReactNode}</span>
        <AllHandles color={color} />
      </CircleNode>
    </TooltipWrapper>
  );
});

// Surge Tank
export const SurgeTankNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  const color = COLORS.surgeTank;

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Surge Tank Properties" />}>
      <CircleNode color={color} selected={selected} hasOrderError={hasOrderError}>
        <span className="text-[12px] font-bold text-black leading-none">{data.label as React.ReactNode}</span>
        <AllHandles color={color} />
      </CircleNode>
    </TooltipWrapper>
  );
});

// Pump Node
export const PumpNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  const color = COLORS.pump;

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Pump Properties" />}>
      <CircleNode color={color} selected={selected} hasOrderError={hasOrderError}>
        <span className="text-[12px] font-bold text-black leading-none">{data.label as React.ReactNode}</span>
        <AllHandles color={color} />
      </CircleNode>
    </TooltipWrapper>
  );
});

// Check Valve Node
export const CheckValveNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  const color = COLORS.checkValve;

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Check Valve Properties" />}>
      <CircleNode color={color} selected={selected} hasOrderError={hasOrderError}>
        <span className="text-[12px] font-bold text-black leading-none">{data.label as React.ReactNode}</span>
        <AllHandles color={color} />
      </CircleNode>
    </TooltipWrapper>
  );
});

// Turbine Node
export const TurbineNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  const color = COLORS.turbine;

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Turbine Properties" />}>
      <CircleNode color={color} selected={selected} hasOrderError={hasOrderError}>
        <span className="text-[12px] font-bold text-black leading-none">{data.label as React.ReactNode}</span>
        <AllHandles color={color} />
      </CircleNode>
    </TooltipWrapper>
  );
});

// Flow Boundary
export const FlowBoundaryNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Flow Boundary Properties" />}>
      <div className={clsx(
        "p-2 rounded border shadow-sm flex items-center gap-2 transition-all bg-green-50 group relative",
        hasOrderError ? "border-red-500 ring-2 ring-red-500/40" : selected ? "border-green-500 ring-1 ring-green-500/30" : "border-green-400"
      )}>
        <Handle type="target" id="t-top"    position={Position.Top}    className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="source" id="s-top"    position={Position.Top}    className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="target" id="t-left"   position={Position.Left}   className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="source" id="s-left"   position={Position.Left}   className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="target" id="t-right"  position={Position.Right}  className={clsx(HandleStyle, "!bg-green-500")} />
        <Handle type="source" id="s-right"  position={Position.Right}  className={clsx(HandleStyle, "!bg-green-500")} />
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-green-600 border-b-[6px] border-b-transparent"></div>
        <div>
          <div className="text-xs font-bold text-green-800">{data.label as React.ReactNode}</div>
          <div className="text-[10px] text-green-600">Q-Sched: {data.scheduleNumber as React.ReactNode}</div>
        </div>
      </div>
    </TooltipWrapper>
  );
});
