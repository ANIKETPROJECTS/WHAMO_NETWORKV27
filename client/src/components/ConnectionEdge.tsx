import { memo, type ReactNode } from 'react';
import {
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { TooltipWrapper, DataList } from './TooltipWrapper';
import { useNetworkStore } from '@/lib/store';

function ElementCircle({ color, label }: { color: string; label?: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{label}</span>
    </div>
  );
}

export const ConnectionEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edge = useNetworkStore(state => state.edges.find(e => e.id === id));
  const displayData = edge ? edge.data : data;

  const edgeType = displayData?.type as string;
  const isPump = edgeType === 'pump';
  const isCheckValve = edgeType === 'checkValve';
  const isTurbine = edgeType === 'turbine';
  const isElementEdge = isPump || isCheckValve || isTurbine;
  const isDummy = edgeType === 'dummy';

  // Match each edge type to its distinct dark element color
  const strokeColor = isPump ? '#6d28d9'       // Deep Purple
    : isCheckValve ? '#047857'                  // Dark Emerald Green
    : isTurbine ? '#0e7490'                     // Dark Cyan
    : isDummy ? '#94a3b8'                       // Slate (neutral)
    : '#1d4ed8';                                // Royal Blue (conduit)

  const strokeDasharray = isDummy ? '8 8' : undefined;

  const tooltipTitle = isPump ? 'Pump Properties'
    : isCheckValve ? 'Check Valve Properties'
    : isTurbine ? 'Turbine Properties'
    : isDummy ? 'Dummy Pipe Properties'
    : 'Conduit Properties';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2.5,
          stroke: strokeColor,
          strokeDasharray,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <TooltipWrapper
            content={<DataList data={displayData} title={tooltipTitle} />}
          >
            {isElementEdge ? (
              <div className="flex flex-col items-center gap-0.5 cursor-help">
                <ElementCircle color={strokeColor} label={(displayData?.label as string) || id} />
              </div>
            ) : (
              <div className="bg-white px-2 py-0.5 rounded-full border border-black text-[10px] font-semibold text-black cursor-help hover:bg-slate-50 transition-colors">
                {(displayData?.label as ReactNode) || id}
              </div>
            )}
          </TooltipWrapper>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
