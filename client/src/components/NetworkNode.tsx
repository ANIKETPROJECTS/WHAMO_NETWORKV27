import { Handle, Position, NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { memo } from 'react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';
import damIcon from '@assets/dam_1779522984604.png';
import yIntersectionIcon from '@assets/y-intersection_(1)_1779523210044.png';
import waterTankIcon from '@assets/water-tank_(2)_1779523360829.png';
import waterPumpIcon from '@assets/water-pump_1779523451215.png';
import pipeIcon from '@assets/pipe_1779523475650.png';
import turbineImgIcon from '@assets/turbine_1779523517554.png';
import windIcon from '@assets/wind_1779523398812.png';

const HandleStyle = "w-2 h-2 bg-black border border-white opacity-0 group-hover:opacity-100 transition-opacity";

function useNodeOrderError(id: string) {
  return useNetworkStore(state => state.nodeOrderErrorIds.includes(id));
}

// Node size constants
const CIRCLE_SIZE = 56;
const ICON_SIZE = 32;

// Shared circle style — all black
function circleStyle(selected: boolean, hasOrderError: boolean): React.CSSProperties {
  return {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: '50%',
    border: `3px solid ${hasOrderError ? '#ef4444' : '#000'}`,
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.15s',
    boxShadow: selected ? '0 0 0 3px rgba(0,0,0,0.15)' : undefined,
    flexShrink: 0,
  };
}

// Wrapper that fixes the bounding box to circle size only — label floats outside via absolute
function IconNode({
  circleContent,
  label,
  handles,
}: {
  circleContent: React.ReactNode;
  label: React.ReactNode;
  handles: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', width: CIRCLE_SIZE, height: CIRCLE_SIZE }} className="group">
      {circleContent}
      {handles}
      <span style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 5,
        fontSize: 13,
        fontWeight: 700,
        color: '#000',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        userSelect: 'none',
        lineHeight: 1,
      }}>
        {label}
      </span>
    </div>
  );
}

const AllHandles = ({ color = '#000' }: { color?: string }) => (
  <>
    <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} style={{ background: color }} />
    <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} style={{ background: color }} />
    <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: color }} />
    <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} style={{ background: color }} />
    <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} style={{ background: color }} />
    <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} style={{ background: color }} />
    <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} style={{ background: color }} />
    <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} style={{ background: color }} />
  </>
);

// Reservoir Node
export const ReservoirNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Reservoir Properties" />}>
      <IconNode
        label={data.label as React.ReactNode}
        handles={<AllHandles />}
        circleContent={
          <div style={circleStyle(!!selected, hasOrderError)}>
            <img src={damIcon} style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', pointerEvents: 'none' }} alt="Reservoir" />
          </div>
        }
      />
    </TooltipWrapper>
  );
});

// Basic Node (Simple Node)
export const SimpleNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Node Properties" />}>
      <div style={{ position: 'relative', width: CIRCLE_SIZE, height: CIRCLE_SIZE }} className="group">
        <div style={circleStyle(!!selected, hasOrderError)}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>
            N{data.nodeNumber as React.ReactNode}
          </span>
        </div>
        <AllHandles />
      </div>
    </TooltipWrapper>
  );
});

// Junction Node
export const JunctionNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Junction Properties" />}>
      <IconNode
        label={`J${data.nodeNumber as React.ReactNode}`}
        handles={<AllHandles />}
        circleContent={
          <div style={circleStyle(!!selected, hasOrderError)}>
            <img src={yIntersectionIcon} style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', pointerEvents: 'none' }} alt="Junction" />
          </div>
        }
      />
    </TooltipWrapper>
  );
});

// Surge Tank
export const SurgeTankNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Surge Tank Properties" />}>
      <IconNode
        label={data.label as React.ReactNode}
        handles={<AllHandles />}
        circleContent={
          <div style={circleStyle(!!selected, hasOrderError)}>
            <img src={waterTankIcon} style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', pointerEvents: 'none' }} alt="Surge Tank" />
          </div>
        }
      />
    </TooltipWrapper>
  );
});

// Pump Node
export const PumpNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Pump Properties" />}>
      <IconNode
        label={data.label as React.ReactNode}
        handles={<AllHandles />}
        circleContent={
          <div style={circleStyle(!!selected, hasOrderError)}>
            <img src={waterPumpIcon} style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', pointerEvents: 'none' }} alt="Pump" />
          </div>
        }
      />
    </TooltipWrapper>
  );
});

// Check Valve Node
export const CheckValveNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Check Valve Properties" />}>
      <IconNode
        label={data.label as React.ReactNode}
        handles={<AllHandles />}
        circleContent={
          <div style={circleStyle(!!selected, hasOrderError)}>
            <img src={pipeIcon} style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', pointerEvents: 'none' }} alt="Check Valve" />
          </div>
        }
      />
    </TooltipWrapper>
  );
});

// Turbine Node
export const TurbineNode = memo(({ id, data, selected }: NodeProps) => {
  const node = useNetworkStore(state => state.nodes.find(n => n.id === id));
  const displayData = node ? node.data : data;
  const hasOrderError = useNodeOrderError(id);

  return (
    <TooltipWrapper content={<DataList data={displayData} title="Turbine Properties" />}>
      <IconNode
        label={data.label as React.ReactNode}
        handles={<AllHandles />}
        circleContent={
          <div style={circleStyle(!!selected, hasOrderError)}>
            <img src={turbineImgIcon} style={{ width: ICON_SIZE, height: ICON_SIZE, objectFit: 'contain', pointerEvents: 'none' }} alt="Turbine" />
          </div>
        }
      />
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
      <div
        className="group relative"
        style={{
          padding: '8px 14px',
          border: `2px solid ${hasOrderError ? '#ef4444' : '#000'}`,
          borderRadius: 6,
          background: 'white',
          boxShadow: selected ? '0 0 0 2px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.08)',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minWidth: 60,
        }}
      >
        <Handle type="target" id="t-top" position={Position.Top} className={HandleStyle} />
        <Handle type="source" id="s-top" position={Position.Top} className={HandleStyle} />
        <Handle type="target" id="t-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="source" id="s-bottom" position={Position.Bottom} className={HandleStyle} />
        <Handle type="target" id="t-left" position={Position.Left} className={HandleStyle} />
        <Handle type="source" id="s-left" position={Position.Left} className={HandleStyle} />
        <Handle type="target" id="t-right" position={Position.Right} className={HandleStyle} />
        <Handle type="source" id="s-right" position={Position.Right} className={HandleStyle} />
        <img src={windIcon} style={{ width: 28, height: 28, objectFit: 'contain', pointerEvents: 'none' }} alt="Flow BC" />
        <div style={{ fontSize: 12, fontWeight: 700, color: '#000', lineHeight: 1 }}>
          {data.label as React.ReactNode}
        </div>
        <div style={{ fontSize: 10, color: '#333', lineHeight: 1 }}>
          Q-Sched: {data.scheduleNumber as React.ReactNode}
        </div>
      </div>
    </TooltipWrapper>
  );
});
