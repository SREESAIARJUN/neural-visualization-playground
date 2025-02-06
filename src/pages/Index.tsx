import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import NetworkVisualization from '@/components/NeuralNetwork/NetworkVisualization';
import Controls from '@/components/NeuralNetwork/Controls';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [model, setModel] = useState<tf.Sequential | null>(null);
  const [input1, setInput1] = useState(0);
  const [input2, setInput2] = useState(0);
  const [operation, setOperation] = useState('AND');
  const [isTraining, setIsTraining] = useState(false);
  const [weights, setWeights] = useState<number[][]>([]);
  const [activations, setActivations] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize model
    const newModel = tf.sequential({
      layers: [
        tf.layers.dense({ units: 3, inputShape: [2], activation: 'sigmoid' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    newModel.compile({
      optimizer: tf.train.adam(0.1),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    setModel(newModel);
  }, []);

  const generateTrainingData = () => {
    const inputs: number[][] = [
      [0, 0], [0, 1], [1, 0], [1, 1]
    ];
    
    let outputs: number[];
    switch (operation) {
      case 'AND':
        outputs = [0, 0, 0, 1];
        break;
      case 'OR':
        outputs = [0, 1, 1, 1];
        break;
      case 'XOR':
        outputs = [0, 1, 1, 0];
        break;
      case 'NAND':
        outputs = [1, 1, 1, 0];
        break;
      case 'NOR':
        outputs = [1, 0, 0, 0];
        break;
      default:
        outputs = [0, 0, 0, 1]; // Default to AND
    }
    
    return {
      xs: tf.tensor2d(inputs),
      ys: tf.tensor2d(outputs, [4, 1])
    };
  };

  const trainNetwork = async () => {
    if (!model) return;
    
    setIsTraining(true);
    const { xs, ys } = generateTrainingData();
    
    try {
      await model.fit(xs, ys, {
        epochs: 100,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (logs?.acc && logs.acc > 0.95) {
              model.stopTraining = true;
            }
          }
        }
      });

      toast({
        title: "Training Complete",
        description: "Neural network has been trained successfully!",
      });

      // Update visualization
      const weights = model.layers.map(layer => 
        layer.getWeights()[0].arraySync() as number[][]
      );
      setWeights(weights);
      
      // Predict current inputs
      const prediction = model.predict(tf.tensor2d([[input1, input2]], [1, 2])) as tf.Tensor;
      const activationValue = prediction.dataSync()[0];
      setActivations([input1, input2, activationValue]);

    } catch (error) {
      toast({
        title: "Training Error",
        description: "An error occurred during training. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
    }
  };

  const resetNetwork = () => {
    if (!model) return;
    
    model.dispose();
    const newModel = tf.sequential({
      layers: [
        tf.layers.dense({ units: 3, inputShape: [2], activation: 'sigmoid' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    newModel.compile({
      optimizer: tf.train.adam(0.1),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    setModel(newModel);
    setWeights([]);
    setActivations([]);
    
    toast({
      title: "Network Reset",
      description: "The neural network has been reset to its initial state.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Neural Network Visualization
          </h1>
          <p className="text-lg text-gray-600">
            Train a neural network to learn logical operations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Controls
            onInput1Change={setInput1}
            onInput2Change={setInput2}
            onOperationChange={setOperation}
            onTrain={trainNetwork}
            onReset={resetNetwork}
            isTraining={isTraining}
          />
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <NetworkVisualization
              weights={weights}
              activations={activations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;