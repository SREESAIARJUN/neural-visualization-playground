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

    // Draw connections with weight-based styling
    const connections = svg.append("g");
    nodes.forEach((node, i) => {
      if (node.layer < layers.length - 1) {
        const nextLayer = nodes.filter(n => n.layer === node.layer + 1);
        nextLayer.forEach((nextNode, j) => {
          const weight = weights[node.layer]?.[i * nextLayer.length + j] || 0;
          const weightStrength = Math.abs(weight);
          
          connections.append("line")
            .attr("x1", node.x)
            .attr("y1", node.y)
            .attr("x2", nextNode.x)
            .attr("y2", nextNode.y)
            .attr("stroke", weight > 0 ? "#4CAF50" : "#f44336")
            .attr("stroke-width", Math.max(1, weightStrength * 3))
            .attr("opacity", 0.6)
            .attr("class", "connection-line")
            .style("transition", "all 0.3s ease-in-out");
        });
      }
    });

    // Draw nodes with activation visualization
    const nodeGroup = svg.append("g");
    nodes.forEach((node, i) => {
      const activation = activations[i] || 0;
      const nodeColor = d3.interpolateRgb("#e0e0e0", "#2196F3")(activation);
      
      // Outer circle (neuron body)
      nodeGroup.append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", nodeRadius)
        .attr("fill", nodeColor)
        .attr("stroke", "#1976D2")
        .attr("stroke-width", 2)
        .attr("class", "neuron")
        .style("transition", "all 0.3s ease-in-out");

      // Activation value text
      nodeGroup.append("text")
        .attr("x", node.x)
        .attr("y", node.y)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .text(activation.toFixed(2));

      // Add pulse animation for active neurons
      if (activation > 0.5) {
        nodeGroup.append("circle")
          .attr("cx", node.x)
          .attr("cy", node.y)
          .attr("r", nodeRadius)
          .attr("fill", "none")
          .attr("stroke", "#2196F3")
          .attr("stroke-width", 2)
          .attr("class", "pulse-ring");
      }
    });

    // Add layer labels
    const labels = ["Input", "Hidden", "Output"];
    labels.forEach((label, i) => {
      svg.append("text")
        .attr("x", layerSpacing + (i * layerSpacing))
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#666")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(label);
    });

  }, [weights, activations]);

  return (
    <div className="network-visualization">
      <svg 
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};

export default NetworkVisualization;