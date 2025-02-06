import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface ControlsProps {
  onInput1Change: (value: number) => void;
  onInput2Change: (value: number) => void;
  onOperationChange: (operation: string) => void;
  onTrain: () => void;
  onReset: () => void;
  onAddTrainingData: () => void;
  isTraining: boolean;
  epochCount?: number;
  trainingProgress?: number;
  trainingError?: number;
}

const Controls: React.FC<ControlsProps> = ({
  onInput1Change,
  onInput2Change,
  onOperationChange,
  onTrain,
  onReset,
  onAddTrainingData,
  isTraining,
  epochCount = 0,
  trainingProgress = 0,
  trainingError = 0
}) => {
  const operations = [
    'AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR', 
    'IMPLIES', 'NIMPLIES', 'NOT', 'BUFFER'
  ];

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Network Controls</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Input 1</label>
          <Select onValueChange={(value) => onInput1Change(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1">1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Input 2</label>
          <Select onValueChange={(value) => onInput2Change(Number(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1">1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Operation</label>
          <Select onValueChange={onOperationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              {operations.map((op) => (
                <SelectItem key={op} value={op}>{op}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isTraining && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Training Progress</span>
              <span>{trainingProgress.toFixed(1)}%</span>
            </div>
            <Progress value={trainingProgress} />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Epoch: {epochCount}</span>
              <span>Error: {trainingError.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={onTrain}
          disabled={isTraining}
          className="bg-neural-primary hover:bg-neural-secondary text-white"
        >
          {isTraining ? "Training..." : "Train Network"}
        </Button>
        <Button 
          onClick={onAddTrainingData}
          disabled={isTraining}
          variant="outline"
        >
          Add Training Data
        </Button>
        <Button 
          onClick={onReset}
          variant="outline"
          className="text-red-500 hover:text-red-700"
        >
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default Controls;