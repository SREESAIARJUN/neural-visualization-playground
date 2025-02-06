import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ControlsProps {
  onInput1Change: (value: number) => void;
  onInput2Change: (value: number) => void;
  onOperationChange: (operation: string) => void;
  onTrain: () => void;
  onReset: () => void;
  isTraining: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  onInput1Change,
  onInput2Change,
  onOperationChange,
  onTrain,
  onReset,
  isTraining
}) => {
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
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
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
              <SelectItem value="XOR">XOR</SelectItem>
              <SelectItem value="NAND">NAND</SelectItem>
              <SelectItem value="NOR">NOR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-x-4">
        <Button 
          onClick={onTrain}
          disabled={isTraining}
          className="bg-neural-primary hover:bg-neural-secondary text-white"
        >
          {isTraining ? "Training..." : "Train Network"}
        </Button>
        <Button 
          onClick={onReset}
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Controls;