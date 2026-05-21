import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { memo } from 'react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';

const HandleStyle = "w-2 h-2 border border-white opacity-0 group-hover:opacity-100 transition-opacity";

function useNodeOrderError(id: string) {
  return useNetworkStore(state => state.nodeOrderErrorIds.includes(id));
}

function CircleNode({
  id,
  data,
  selected,
  displayData,
  tooltipTitle,
  color,
  label,
  hasOrderError,
}: {
  id: string;
  data: Record<string, unknown>;
  selected?: boolean;
  displayData: Record<string, unknown>;
  tooltipTitle: string;
  color: string;
  label: React.ReactNode;
  hasOrderError: boolean;
}) {
  return (
    <TooltipWrapper content={<DataList data={displayData} title={tooltipTitle} />}>
      <div
        className={clsx(
          "w-9 h-9 rounded-full flex items-center justify-center transition-all relative group",
          hasOrderError
            ? "ring-4 ring-red-500 ring-offset-1"
            : selected
            ? "ring-2 ring-offset-1 ring-white/60"
            : ""
        )}
        style={{ backgroundColor: color }}
      >
        <span className="text-[12px] font-bold text-white leading-none select-none">{label}</span>

        <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} style={{ background: color }} />
        <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} style={{ background: color }} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: color }} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: color }} />
        <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} style={{ background: color }} />
        <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} style={{ background: color }} />
        <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} style={{ background: color }} />
        <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} style={{ background: color }} />
      </div>
    </TooltipWrapper>
  );
}

// Reservoir Node — Deep Navy Blue
export const ReservoirNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <CircleNode
      id={id} data={data as Record<string, unknown>} selected={selected}
      displayData={displayData as Record<string, unknown>}
      tooltipTitle="Reservoir Properties"
      color="#1e3a8a"
      label={data.label as React.ReactNode}
      hasOrderError={hasOrderError}
    />
  );
});

// Basic Node (Simple Node) — Royal Blue
export const SimpleNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <CircleNode
      id={id} data={data as Record<string, unknown>} selected={selected}
      displayData={displayData as Record<string, unknown>}
      tooltipTitle="Node Properties"
      color="#1d4ed8"
      label={<>N{data.nodeNumber as React.ReactNode}</>}
      hasOrderError={hasOrderError}
    />
  );
});

// Junction Node — Deep Crimson
export const JunctionNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <CircleNode
      id={id} data={data as Record<string, unknown>} selected={selected}
      displayData={displayData as Record<string, unknown>}
      tooltipTitle="Junction Properties"
      color="#b91c1c"
      label={<>J{data.nodeNumber as React.ReactNode}</>}
      hasOrderError={hasOrderError}
    />
  );
});

// Surge Tank — Dark Amber
export const SurgeTankNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <CircleNode
      id={id} data={data as Record<string, unknown>} selected={selected}
      displayData={displayData as Record<string, unknown>}
      tooltipTitle="Surge Tank Properties"
      color="#b45309"
      label={data.label as React.ReactNode}
      hasOrderError={hasOrderError}
    />
  );
});

// Pump Node — Deep Purple
export const PumpNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <CircleNode
      id={id} data={data as Record<string, unknown>} selected={selected}
      displayData={displayData as Record<string, unknown>}
      tooltipTitle="Pump Properties"
      color="#6d28d9"
      label={data.label as React.ReactNode}
      hasOrderError={hasOrderError}
    />
  );
});

// Check Valve Node — Dark Emerald Green
export const CheckValveNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <CircleNode
      id={id} data={data as Record<string, unknown>} selected={selected}
      displayData={displayData as Record<string, unknown>}
      tooltipTitle="Check Valve Properties"
      color="#047857"
      label={data.label as React.ReactNode}
      hasOrderError={hasOrderError}
    />
  );
});

// Turbine Node — Dark Cyan
export const TurbineNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);
  return (
    <CircleNode
      id={id} data={data as Record<string, unknown>} selected={selected}
      displayData={displayData as Record<string, unknown>}
      tooltipTitle="Turbine Properties"
      color="#0e7490"
      label={data.label as React.ReactNode}
      hasOrderError={hasOrderError}
    />
  );
});

// Flow Boundary — Dark Forest Green
export const FlowBoundaryNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData as Record<string, unknown>} title="Flow Boundary Properties" />}>
      <div className={clsx(
        "p-2 rounded border-2 flex items-center gap-2 transition-all group relative",
        hasOrderError ? "border-red-500 ring-2 ring-red-500/40 bg-red-50" : selected ? "border-green-800 ring-1 ring-green-800/30 bg-green-900/10" : "border-green-800 bg-green-900/10"
      )}>
        <Handle type="target" id="t-top" position={Position.Top} className={clsx(HandleStyle, "!bg-green-800")} />
        <Handle type="source" id="s-top" position={Position.Top} className={clsx(HandleStyle, "!bg-green-800")} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-green-800")} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={clsx(HandleStyle, "!bg-green-800")} />
        <Handle type="target" id="t-left" position={Position.Left} className={clsx(HandleStyle, "!bg-green-800")} />
        <Handle type="source" id="s-left" position={Position.Left} className={clsx(HandleStyle, "!bg-green-800")} />
        <Handle type="target" id="t-right" position={Position.Right} className={clsx(HandleStyle, "!bg-green-800")} />
        <Handle type="source" id="s-right" position={Position.Right} className={clsx(HandleStyle, "!bg-green-800")} />
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-green-800 border-b-[6px] border-b-transparent"></div>
        <div>
          <div className="text-xs font-bold text-green-900">{data.label as React.ReactNode}</div>
          <div className="text-[10px] text-green-800">Q-Sched: {data.scheduleNumber as React.ReactNode}</div>
        </div>
      </div>
    </TooltipWrapper>
  );
});
