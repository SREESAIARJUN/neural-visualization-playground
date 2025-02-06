import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface NetworkVisualizationProps {
  weights: number[][];
  activations: number[];
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ weights, activations }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;
    const layerSpacing = width / 4;
    const nodeRadius = 20;

    // Create layers
    const layers = [2, 3, 1]; // Input, hidden, output layers
    let nodes: { x: number; y: number; layer: number; index: number }[] = [];
    
    layers.forEach((nodeCount, layerIndex) => {
      const layerX = layerSpacing + (layerIndex * layerSpacing);
      
      for (let i = 0; i < nodeCount; i++) {
        const spacing = height / (nodeCount + 1);
        nodes.push({
          x: layerX,
          y: spacing + (i * spacing),
          layer: layerIndex,
          index: i
        });
      }
    });

    // Draw connections
    const connections = svg.append("g");
    nodes.forEach((node, i) => {
      if (node.layer < layers.length - 1) {
        const nextLayer = nodes.filter(n => n.layer === node.layer + 1);
        nextLayer.forEach(nextNode => {
          connections.append("line")
            .attr("x1", node.x)
            .attr("y1", node.y)
            .attr("x2", nextNode.x)
            .attr("y2", nextNode.y)
            .attr("stroke", "var(--neural-connection)")
            .attr("stroke-width", 2)
            .attr("opacity", 0.6);
        });
      }
    });

    // Draw nodes
    const nodeGroup = svg.append("g");
    nodes.forEach((node, i) => {
      const circle = nodeGroup.append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", nodeRadius)
        .attr("fill", "var(--neural-neuron)")
        .attr("stroke", "var(--neural-primary)")
        .attr("stroke-width", 2)
        .attr("class", "transition-all duration-300 ease-in-out");

      if (activations[i]) {
        circle.classed("animate-neuron-pulse", true);
      }
    });

  }, [weights, activations]);

  return (
    <svg 
      ref={svgRef}
      className="w-full h-full"
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

export default NetworkVisualization;