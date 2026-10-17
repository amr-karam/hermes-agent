import React, { useEffect, useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router";

const AgentProfilePage: React.FC = () => {
  const { agents } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-open first agent profile
    if (agents.length > 0 && !selectedId) {
      setSelectedId(agents[0].id);
    }
  }, [agents]);

  if (!agents.length) {
    return (
      <div className="p-6 text-center">
        <div className="text-center text-gray-500">
          No agents found. Check configuration.
        </div>
      </div>
    );
  }

  const agent = agents.find(a => a.id === selectedId);
  if (!agent) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-900 text-white p-6">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Agent Profile</h1>
          <button 
            className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
            onClick={() => navigate('/')}
          >
            Home
          </button>
        </div>

        {/* Agent Details */}
        <div className="bg-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-3xl">{agent.name.charAt(0)}</span>
            </div>
            <div className="ml-3">
              <div className="font-bold">{agent.name}</div>
              <div className="text-sm text-gray-400">
                {agent.role} • {agent.model}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-300">{agent.description}</p>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Status</h3>
              <span className={`px-2 py-1 rounded-full ${
                agent.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'
              }`}>
                {agent.status === 'active' ? 'Active' : 'Idle'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="bg-white/15 rounded-xl p-6 border border-white/30 hover:bg-white/20 transition">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white text-2xl">{agent.name.charAt(0)}</span>
              </div>
              <div className="ml-3">
                <div className="font-medium">{agent.name}</div>
                <div className="text-sm text-gray-400">{agent.role}</div>
              </div>
            </div>
            <div className="ml-3">
              <button 
                className="bg-white/20 text-white px-3 py-1 rounded hover:bg-white/30 hover:text-white transition"
                onClick={() => setSelectedId(null)}
              >
                <span className="text-sm text-gray-400">Back</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-sm text-gray-500">{agent.description}</p>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Model</h3>
              <span className="inline-block bg-gray-200 text-xs text-gray-700 px-2.5 py-0.5 rounded">
                {agent.model}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Actions</h3>
          <div className="flex space-x-4">
            <button 
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
              onClick={() => navigate('/agents')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProfilePage;
