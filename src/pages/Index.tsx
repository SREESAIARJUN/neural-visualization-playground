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
  const [epochCount, setEpochCount] = useState(0);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingError, setTrainingError] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = () => {
    const newModel = tf.sequential({
      layers: [
        tf.layers.dense({ 
          units: 3, 
          inputShape: [2], 
          activation: 'sigmoid',
          kernelInitializer: 'randomNormal'
        }),
        tf.layers.dense({ 
          units: 1, 
          activation: 'sigmoid',
          kernelInitializer: 'randomNormal'
        })
      ]
    });
    
    newModel.compile({
      optimizer: tf.train.adam(0.1),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });

    setModel(newModel);
    updateWeightsAndActivations(newModel);
  };

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
      case 'XNOR':
        outputs = [1, 0, 0, 1];
        break;
      case 'IMPLIES':
        outputs = [1, 1, 0, 1];
        break;
      case 'NIMPLIES':
        outputs = [0, 0, 1, 0];
        break;
      case 'NOT':
        outputs = [1, 1, 0, 0];
        break;
      case 'BUFFER':
        outputs = [0, 0, 1, 1];
        break;
      default:
        outputs = [0, 0, 0, 1]; // Default to AND
    }
    
    return {
      xs: tf.tensor2d(inputs),
      ys: tf.tensor2d(outputs, [4, 1])
    };
  };

  const updateWeightsAndActivations = async (currentModel: tf.Sequential) => {
    // Get weights from each layer
    const layerWeights = currentModel.layers.map(layer => {
      const [weights] = layer.getWeights();
      return weights.arraySync() as number[][];
    });
    setWeights(layerWeights);

    // Get activations for current input
    const inputTensor = tf.tensor2d([[input1, input2]], [1, 2]);
    const layerOutputs: number[] = [];
    
    // Input layer activations
    layerOutputs.push(input1, input2);
    
    // Hidden layer activations
    const hiddenLayerOutput = tf.tidy(() => {
      const hidden = currentModel.layers[0].apply(inputTensor) as tf.Tensor;
      return hidden.dataSync();
    });
    layerOutputs.push(...Array.from(hiddenLayerOutput));
    
    // Output layer activation
    const prediction = currentModel.predict(inputTensor) as tf.Tensor;
    const outputActivation = prediction.dataSync()[0];
    layerOutputs.push(outputActivation);
    
    setActivations(layerOutputs);
    
    // Cleanup tensors
    inputTensor.dispose();
    prediction.dispose();
  };

  const trainNetwork = async () => {
    if (!model) return;
    
    setIsTraining(true);
    const { xs, ys } = generateTrainingData();
    
    try {
      await model.fit(xs, ys, {
        epochs: 100,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            setEpochCount(epoch + 1);
            setTrainingProgress(((epoch + 1) / 100) * 100);
            setTrainingError(logs?.loss || 0);
            
            // Update visualization every few epochs
            if (epoch % 5 === 0) {
              await updateWeightsAndActivations(model);
            }

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

      await updateWeightsAndActivations(model);

    } catch (error) {
      toast({
        title: "Training Error",
        description: "An error occurred during training. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTraining(false);
      xs.dispose();
      ys.dispose();
    }
  };

  const resetNetwork = () => {
    if (model) {
      model.dispose();
    }
    setEpochCount(0);
    setTrainingProgress(0);
    setTrainingError(0);
    initializeModel();
    
    toast({
      title: "Network Reset",
      description: "The neural network has been reset to its initial state.",
    });
  };

  const addTrainingData = () => {
    const { ys } = generateTrainingData();
    const expectedOutput = ys.arraySync()[0][0];
    
    toast({
      title: "Training Data Added",
      description: `Added training pair: [${input1}, ${input2}] → ${expectedOutput}`,
    });

    ys.dispose();
  };

  // Update activations whenever inputs change
  useEffect(() => {
    if (model) {
      updateWeightsAndActivations(model);
    }
  }, [input1, input2, operation]);

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
            onAddTrainingData={addTrainingData}
            isTraining={isTraining}
            epochCount={epochCount}
            trainingProgress={trainingProgress}
            trainingError={trainingError}
          />
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <NetworkVisualization
              weights={weights}
              activations={activations}
              epochCount={epochCount}
              error={trainingError}
              isTraining={isTraining}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;