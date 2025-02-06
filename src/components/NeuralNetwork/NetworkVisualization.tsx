import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from "@/components/ui/card";

interface NetworkVisualizationProps {
  weights: number[][];
  activations: number[];
  epochCount?: number;
  error?: number;
  isTraining?: boolean;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({ 
  weights, 
  activations, 
  epochCount = 0,
  error = 0,
  isTraining = false 
}) => {
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

    // Draw connections with enhanced weight visualization
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
            .append("title")
            .text(`Weight: ${weight.toFixed(4)}`);
        });
      }
    });

    // Draw nodes with enhanced activation visualization
    const nodeGroup = svg.append("g");
    nodes.forEach((node, i) => {
      const activation = activations[i] || 0;
      const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
      const nodeColor = d3.interpolateRgb("#e0e0e0", "#2196F3")(sigmoid(activation));
      
      const neuronGroup = nodeGroup.append("g")
        .attr("class", "neuron-group")
        .style("cursor", "pointer");

      // Neuron body with gradient
      const gradient = svg.append("defs")
        .append("radialGradient")
        .attr("id", `gradient-${i}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", nodeColor)
        .attr("stop-opacity", 1);

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.color(nodeColor)?.darker().toString() || nodeColor)
        .attr("stop-opacity", 0.8);

      // Outer circle (neuron body)
      neuronGroup.append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", nodeRadius)
        .attr("fill", `url(#gradient-${i})`)
        .attr("stroke", "#1976D2")
        .attr("stroke-width", 2)
        .attr("class", `neuron ${isTraining ? 'animate-pulse' : ''}`);

      // Activation value with improved visibility
      neuronGroup.append("text")
        .attr("x", node.x)
        .attr("y", node.y)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(sigmoid(activation).toFixed(3));

      // Add tooltip with raw and sigmoid values
      neuronGroup.append("title")
        .text(`Raw: ${activation.toFixed(4)}\nSigmoid: ${sigmoid(activation).toFixed(4)}`);

      // Activation pulse animation
      if (sigmoid(activation) > 0.5) {
        neuronGroup.append("circle")
          .attr("cx", node.x)
          .attr("cy", node.y)
          .attr("r", nodeRadius)
          .attr("fill", "none")
          .attr("stroke", "#2196F3")
          .attr("stroke-width", 2)
          .attr("class", "pulse-ring");
      }
    });

    // Enhanced layer labels
    const labels = ["Input", "Hidden", "Output"];
    labels.forEach((label, i) => {
      const labelGroup = svg.append("g")
        .attr("class", "layer-label")
        .style("cursor", "help");

      labelGroup.append("text")
        .attr("x", layerSpacing + (i * layerSpacing))
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("fill", "#666")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(label);
    });

    // Training metrics display
    if (isTraining) {
      const metricsGroup = svg.append("g")
        .attr("transform", `translate(${width - 150}, 20)`);

      metricsGroup.append("text")
        .attr("fill", "#666")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(`Epoch: ${epochCount}`);

      metricsGroup.append("text")
        .attr("y", 20)
        .attr("fill", error > 0.1 ? "#f44336" : "#4CAF50")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .text(`Error: ${error.toFixed(4)}`);
    }

  }, [weights, activations, epochCount, error, isTraining]);

  return (
    <Card className="p-4">
      <svg 
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
      />
    </Card>
  );
};

export default NetworkVisualization;