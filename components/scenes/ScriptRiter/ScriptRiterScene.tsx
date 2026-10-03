import React, { useState, useCallback, useRef, useEffect, ChangeEvent, useMemo } from 'react';
import { Role, NexusNode, Connection, Team, GeneratedRoleIdea } from '../../../types';
import { communityRoles } from '../../../data/communityRoles';
import { generateScenarioIdeas, parseRolesFromFileContent } from '../../../services/geminiService';
import { newId, toRole, validateImportFile } from '../../../services/roleNormalizer';
import PlusIcon from '../../shared-ui/icons/PlusIcon';
import TrashIcon from '../../shared-ui/icons/TrashIcon';
import WandIcon from '../../shared-ui/icons/WandIcon';
import UploadIcon from '../../shared-ui/icons/UploadIcon';
import ConnectIcon from '../../shared-ui/icons/ConnectIcon';
import SpinnerIcon from '../../shared-ui/icons/SpinnerIcon';
import SaveIcon from '../../shared-ui/icons/SaveIcon';
import NewScenarioIcon from '../../shared-ui/icons/NewScenarioIcon';
import BookIcon from '../../shared-ui/icons/BookIcon';
import FolderIcon from '../../shared-ui/icons/FolderIcon';
import ChevronDownIcon from '../../shared-ui/icons/ChevronDownIcon';
import { ConnectionIndicatorIcon } from '../../shared-ui/icons/ConnectionIndicatorIcon';
import CopyIcon from '../../shared-ui/icons/CopyIcon';


const ScriptRiterScene: React.FC = () => {
    const [nodes, setNodes] = useState<NexusNode[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [scenarioName, setScenarioName] = useState('New Scenario');
    const [scenarioDescription, setScenarioDescription] = useState('');

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);

    const [isAIGenModalOpen, setAIGenModalOpen] = useState(false);
    const [isRoleLibraryOpen, setRoleLibraryOpen] = useState(true);

    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const addRoleToScenario = (role: Role) => {
        const newNode: NexusNode = {
            ...role,
            id: newId(`node-${role.id}`),
            x: Math.random() * 500 + 100,
            y: Math.random() * 300 + 100,
        };
        setNodes(prevNodes => [...prevNodes, newNode]);
    };

    const handleNodeClick = (nodeId: string) => {
        if (connectingNodeId && connectingNodeId !== nodeId) {
            const newConnection: Connection = {
                id: newId('conn'),
                from: connectingNodeId,
                to: nodeId,
                type: 'neutral',
                strength: 'normal',
                style: 'solid',
                description: '',
            };
            setConnections(prev => [...prev, newConnection]);
            setConnectingNodeId(null);
        } else {
            setSelectedNodeId(nodeId);
            setSelectedConnectionId(null);
        }
    };

    const handleStartConnection = (nodeId: string) => {
        setConnectingNodeId(nodeId);
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
    };

    const removeNode = (nodeId: string) => {
        setNodes(nodes.filter(n => n.id !== nodeId));
        setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
        if (selectedNodeId === nodeId) {
            setSelectedNodeId(null);
        }
    };

    const removeConnection = (connId: string) => {
        setConnections(connections.filter(c => c.id !== connId));
        if (selectedConnectionId === connId) {
            setSelectedConnectionId(null);
        }
    }
    
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    const selectedConnection = connections.find(c => c.id === selectedConnectionId);

    const updateNode = (updatedNode: NexusNode) => {
        setNodes(nodes.map(n => n.id === updatedNode.id ? updatedNode : n));
    };

    const updateConnection = (updatedConnection: Connection) => {
        setConnections(connections.map(c => c.id === updatedConnection.id ? updatedConnection : c));
    };
    
    // Drag logic
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement>(null);

    const handleMouseDown = (e: React.MouseEvent<SVGGElement>, nodeId: string) => {
        setDraggingNodeId(nodeId);
        const node = nodes.find(n => n.id === nodeId);
        if (node && svgRef.current) {
            const pt = svgRef.current.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
            dragOffset.current = { x: svgP.x - node.x, y: svgP.y - node.y };
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingNodeId || !svgRef.current) return;
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        
        setNodes(currentNodes => 
            currentNodes.map(n => 
                n.id === draggingNodeId
                    ? { ...n, x: svgP.x - dragOffset.current.x, y: svgP.y - dragOffset.current.y }
                    : n
            )
        );
    };
    
    const handleMouseUp = () => {
        setDraggingNodeId(null);
    };

    useEffect(() => {
        if (draggingNodeId) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingNodeId]);


    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const rejection = validateImportFile(file);
        if (rejection) {
            alert(`Error importing roles: ${rejection}`);
            if (event.target) event.target.value = '';
            return;
        }

        const content = await file.text();
        try {
            const parsedRoles = await parseRolesFromFileContent(content);
            parsedRoles.forEach(role => addRoleToScenario(toRole(role, 'imported')));
            alert(`${parsedRoles.length} roles imported successfully!`);
        } catch (error) {
            console.error("Failed to parse roles from file:", error);
            alert(`Error importing roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Reset file input
        if(event.target) event.target.value = '';
    };
    
    const getTeamColor = (team: Team) => {
        switch(team) {
            case Team.TOWN: return 'var(--color-fact-verified)';
            case Team.MAFIA: return 'var(--color-fact-deception)';
            case Team.INDEPENDENT: return 'var(--color-fact-unknown)';
            case Team.THIRD_PARTY: return 'var(--color-fact-conflict)';
            default: return 'var(--color-trust-neutral)';
        }
    }

    const getConnectionLineProps = (connection: Connection) => {
        const props: { strokeWidth: number; strokeDasharray?: string } = {
            strokeWidth: connection.strength === 'strong' ? 4 : 2,
        };
        if (connection.style === 'dashed') {
            props.strokeDasharray = '10, 5';
        } else if (connection.style === 'dotted') {
            props.strokeDasharray = '2, 5';
        }
        return props;
    };

    return (
        <div className="flex h-[calc(100vh-80px)]" style={{ backgroundColor: 'var(--color-surface-dark)'}}>
            {tooltip && (
                <div 
                    className="absolute p-2 rounded-md bg-black/80 text-white text-xs pointer-events-none z-50 animate-fade-in"
                    style={{ top: tooltip.y + 15, left: tooltip.x + 15, maxWidth: '200px' }}
                >
                    {tooltip.content}
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.xml,.html,.md,.wiki" />
            {/* Left Panel: Role Library */}
            <RoleLibraryPanel isOpen={isRoleLibraryOpen} addRoleToScenario={addRoleToScenario} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <header className="flex-shrink-0 p-2 flex items-center justify-between border-b" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setRoleLibraryOpen(!isRoleLibraryOpen)} className="p-2 hover:bg-gray-700 rounded-md terminal-button" title="Toggle Role Library">
                            <BookIcon className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-orbitron font-bold text-white">{scenarioName}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                         <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-gray-700 hover:bg-gray-600 terminal-button" onClick={() => { setNodes([]); setConnections([]); setScenarioName('New Scenario'); }}>
                            <NewScenarioIcon className="w-4 h-4" /> New
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-gray-700 hover:bg-gray-600 terminal-button" onClick={handleImportClick}>
                            <FolderIcon className="w-4 h-4" /> Import
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-[#00FF88]/80 text-black hover:bg-[#00FF88] terminal-button" onClick={() => setAIGenModalOpen(true)}>
                            <WandIcon className="w-4 h-4" /> Generate with AI
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-blue-500 hover:bg-blue-400 terminal-button">
                            <SaveIcon className="w-4 h-4" /> Save
                        </button>
                    </div>
                </header>

                {/* Canvas */}
                <main className="flex-1 relative script-riter-bg" onDoubleClick={() => { setSelectedNodeId(null); setSelectedConnectionId(null); }}>
                    <svg ref={svgRef} width="100%" height="100%">
                        <defs>
                          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                          {connections.map((conn) => {
                                const fromNode = nodes.find(n => n.id === conn.from);
                                const toNode = nodes.find(n => n.id === conn.to);
                                if (!fromNode || !toNode) return null;
                                const gradientId = `grad-${conn.id}`;
                                return (
                                    <linearGradient key={gradientId} id={gradientId} x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} gradientUnits="userSpaceOnUse">
                                        <stop stopColor={getTeamColor(fromNode.team)} />
                                        <stop offset="1" stopColor={getTeamColor(toNode.team)} />
                                    </linearGradient>
                                );
                            })}
                        </defs>
                        {connections.map((conn) => {
                            const fromNode = nodes.find(n => n.id === conn.from);
                            const toNode = nodes.find(n => n.id === conn.to);
                            if (!fromNode || !toNode) return null;
                            const gradientId = `grad-${conn.id}`;
                            const lineProps = getConnectionLineProps(conn);
                            const midX = (fromNode.x + toNode.x) / 2;
                            const midY = (fromNode.y + toNode.y) / 2;
                            const isSelected = selectedConnectionId === conn.id;

                            return (
                                <g key={conn.id} className="cursor-pointer" 
                                    onClick={() => { setSelectedConnectionId(conn.id); setSelectedNodeId(null); }}
                                    onMouseEnter={(e) => { if (conn.description) setTooltip({ x: e.clientX, y: e.clientY, content: conn.description }); }}
                                    onMouseMove={(e) => { if (tooltip) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null); }}
                                    onMouseLeave={() => setTooltip(null)}
                                >
                                    {/* Invisible wider line for easier clicking */}
                                    <line 
                                        x1={fromNode.x} y1={fromNode.y} 
                                        x2={toNode.x} y2={toNode.y} 
                                        stroke="transparent"
                                        strokeWidth="20"
                                    />
                                    <line 
                                        x1={fromNode.x} y1={fromNode.y} 
                                        x2={toNode.x} y2={toNode.y} 
                                        stroke={`url(#${gradientId})`}
                                        strokeWidth={lineProps.strokeWidth}
                                        strokeDasharray={lineProps.strokeDasharray}
                                        style={{ transition: 'stroke-width 0.2s', filter: isSelected ? 'drop-shadow(0 0 5px white)' : 'none' }}
                                    />
                                    <g transform={`translate(${midX}, ${midY}) scale(0.8)`} className="transition-transform duration-200 hover:scale-100">
                                        <circle 
                                            r="15" 
                                            fill="var(--color-surface-light)" 
                                            stroke={isSelected ? 'white' : 'var(--color-border)'}
                                            strokeWidth="1.5"
                                            style={{ 
                                                transition: 'all 0.2s ease-in-out',
                                                filter: isSelected ? 'drop-shadow(0 0 5px white)' : 'none'
                                            }}
                                        />
                                        <ConnectionIndicatorIcon 
                                            type={conn.type} 
                                            x={-12} 
                                            y={-12} 
                                            width={24} 
                                            height={24} 
                                            stroke={isSelected ? 'white' : `url(#${gradientId})`} 
                                            strokeWidth={isSelected ? 2.5 : 2}
                                            className="transition-all duration-200"
                                        />
                                    </g>
                                </g>
                            );
                        })}
                        {nodes.map(node => (
                            <g 
                                key={node.id} 
                                transform={`translate(${node.x}, ${node.y})`} 
                                onMouseDown={(e) => handleMouseDown(e, node.id)}
                                onClick={() => handleNodeClick(node.id)}
                                className="cursor-pointer transition-transform duration-200 hover:scale-110"
                                style={selectedNodeId === node.id ? { 
                                    animation: 'pulse-glow 2s infinite',
                                    '--glow-color': getTeamColor(node.team)
                                  } as React.CSSProperties : { '--glow-color': getTeamColor(node.team) } as React.CSSProperties
                                }
                            >
                                <circle r="30" fill="var(--color-surface)" stroke={getTeamColor(node.team)} strokeWidth="2" style={{ filter: 'url(#glow)' }} />
                                <text y="5" textAnchor="middle" fill="white" className="font-mono text-xs select-none pointer-events-none">{node.name.split(' ')[0]}</text>
                            </g>
                        ))}
                    </svg>
                </main>
            </div>

            {/* Right Panel: Properties */}
            <PropertiesPanel 
                selectedNode={selectedNode}
                selectedConnection={selectedConnection}
                scenarioName={scenarioName}
                scenarioDescription={scenarioDescription}
                onScenarioNameChange={setScenarioName}
                onScenarioDescriptionChange={setScenarioDescription}
                onNodeUpdate={updateNode}
                onNodeDelete={removeNode}
                onStartConnection={handleStartConnection}
                onConnectionUpdate={updateConnection}
                onConnectionDelete={removeConnection}
            />

            {isAIGenModalOpen && (
                <AIGenerationModal 
                    onClose={() => setAIGenModalOpen(false)}
                    onAddRoles={(roles) => {
                        roles.forEach(role => addRoleToScenario(toRole(role, 'ai')));
                    }}
                    existingRoles={nodes}
                />
            )}
        </div>
    );
};

// Sub-components
const RoleLibraryPanel: React.FC<{isOpen: boolean, addRoleToScenario: (role: Role) => void}> = ({isOpen, addRoleToScenario}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openCategories, setOpenCategories] = useState<Set<Team>>(new Set([Team.TOWN]));

    const filteredAndGroupedRoles = useMemo(() => {
        const filtered = communityRoles.filter(r => 
            r.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.reduce((acc, role) => {
            const team = role.team;
            if (!acc[team]) {
                acc[team] = [];
            }
            acc[team].push(role);
            return acc;
        }, {} as Record<Team, Role[]>);

    }, [searchTerm]);

    const toggleCategory = (category: Team) => {
        setOpenCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };
    
    const categoryOrder: Team[] = [Team.TOWN, Team.MAFIA, Team.INDEPENDENT, Team.THIRD_PARTY];

    if (!isOpen) return null;

    return (
        <aside className="w-64 flex-shrink-0 p-2 border-r flex flex-col" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-center mb-2">Role Library</h2>
            <input 
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 rounded-md mb-2 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
            />
            <div className="flex-1 overflow-y-auto">
                {categoryOrder.map(category => {
                    const rolesInCategory = filteredAndGroupedRoles[category];
                    if (!rolesInCategory || rolesInCategory.length === 0) return null;

                    const isExpanded = openCategories.has(category);

                    return (
                        <div key={category} className="mb-2">
                            <button 
                                onClick={() => toggleCategory(category)}
                                className="w-full flex justify-between items-center p-2 rounded-md text-left font-semibold text-sm uppercase terminal-button"
                                style={{ backgroundColor: 'var(--color-surface-light)'}}
                            >
                                <span>{category} ({rolesInCategory.length})</span>
                                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            {isExpanded && (
                                <div className="pt-1">
                                    {rolesInCategory.map(role => (
                                        <div key={role.id} className="p-2 my-1 rounded-md hover:bg-gray-700/50 flex justify-between items-center transition-colors" >
                                            <div className="text-sm">
                                                <p className="font-semibold">{role.name}</p>
                                                <p className="text-xs text-gray-400">{role.category}</p>
                                            </div>
                                            <button onClick={() => addRoleToScenario(role)} className="p-1.5 bg-gray-600 rounded-full hover:bg-secondary terminal-button">
                                                <PlusIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </aside>
    );
}

const PropertiesPanel: React.FC<{
    selectedNode: NexusNode | undefined;
    selectedConnection: Connection | undefined;
    scenarioName: string;
    scenarioDescription: string;
    onScenarioNameChange: (name: string) => void;
    onScenarioDescriptionChange: (desc: string) => void;
    onNodeUpdate: (node: NexusNode) => void;
    onNodeDelete: (nodeId: string) => void;
    onStartConnection: (nodeId: string) => void;
    onConnectionUpdate: (connection: Connection) => void;
    onConnectionDelete: (connectionId: string) => void;
}> = ({ 
    selectedNode, 
    selectedConnection,
    scenarioName, onScenarioNameChange, 
    scenarioDescription, onScenarioDescriptionChange, 
    onNodeUpdate, onNodeDelete, onStartConnection,
    onConnectionUpdate, onConnectionDelete
}) => {
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setIsCopied(false);
    }, [selectedNode?.id]);

    const handleCopyDescription = () => {
        if (selectedNode) {
            navigator.clipboard.writeText(selectedNode.description);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };
    
    const StyleButton: React.FC<{
        label: string;
        style: Connection['style'];
        currentStyle: Connection['style'];
        onClick: (style: Connection['style']) => void;
    }> = ({ label, style, currentStyle, onClick }) => {
        const isActive = style === currentStyle;
        return (
            <button
                type="button"
                onClick={() => onClick(style)}
                className={`flex-1 p-2 rounded-md border-2 flex flex-col items-center justify-center transition-all duration-200 ${
                    isActive
                        ? 'bg-blue-500/20 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-600 hover:border-gray-500 text-gray-400'
                }`}
                aria-pressed={isActive}
            >
                <svg viewBox="0 0 24 10" className="h-3 w-full mb-1.5" aria-hidden="true">
                    {style === 'solid' && <line x1="0" y1="5" x2="24" y2="5" stroke="currentColor" strokeWidth="2" />}
                    {style === 'dashed' && <line x1="0" y1="5" x2="24" y2="5" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />}
                    {style === 'dotted' && <line x1="0" y1="5" x2="24" y2="5" stroke="currentColor" strokeWidth="3" strokeDasharray="0 3" strokeLinecap="round" />}
                </svg>
                <span className="text-xs font-semibold">{label}</span>
            </button>
        );
    };

    const handleNodeChange = (field: keyof NexusNode, value: any) => {
        if(selectedNode) {
            onNodeUpdate({ ...selectedNode, [field]: value });
        }
    }

    const handleConnectionChange = (field: keyof Connection, value: any) => {
        if (selectedConnection) {
            onConnectionUpdate({ ...selectedConnection, [field]: value });
        }
    }

    const renderNodeProperties = () => (
        selectedNode && <div className="space-y-4">
            <div>
                <label className="text-sm font-semibold text-gray-400 block">Name</label>
                <input type="text" value={selectedNode.name} onChange={e => handleNodeChange('name', e.target.value)} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600" />
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-400 block">Team</label>
                <select value={selectedNode.team} onChange={e => handleNodeChange('team', e.target.value)} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600">
                    {Object.values(Team).map(team => <option key={team} value={team}>{team}</option>)}
                </select>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-gray-400 block">Description</label>
                    <button
                        onClick={handleCopyDescription}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-default"
                        disabled={isCopied}
                    >
                        <CopyIcon className="w-4 h-4" />
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <textarea value={selectedNode.description} onChange={e => handleNodeChange('description', e.target.value)} rows={8} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600"></textarea>
            </div>
             <div>
                <label className="text-sm font-semibold text-gray-400 block">Abilities</label>
                {selectedNode.abilities && selectedNode.abilities.length > 0 ? (
                    <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-300 bg-gray-800 p-3 rounded-md border border-gray-600">
                        {selectedNode.abilities.map((ability, index) => (
                            <li key={index}>{ability}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-1 text-sm text-gray-500 italic p-3 rounded-md bg-gray-800 border border-gray-600">No discrete abilities listed. See description.</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={() => onStartConnection(selectedNode.id)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-blue-600 hover:bg-blue-500 terminal-button">
                    <ConnectIcon className="w-4 h-4" /> Connect
                </button>
                <button onClick={() => onNodeDelete(selectedNode.id)} className="p-2 bg-red-800/80 rounded-md hover:bg-red-700 terminal-button" title="Delete Role">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderConnectionProperties = () => (
        selectedConnection && <div className="space-y-4">
            <div>
                <label className="text-sm font-semibold text-gray-400 block">Type</label>
                <select value={selectedConnection.type} onChange={e => handleConnectionChange('type', e.target.value)} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600">
                    <option value="neutral">Neutral</option>
                    <option value="synergy">Synergy</option>
                    <option value="conflict">Conflict</option>
                    <option value="information">Information</option>
                    <option value="protection">Protection</option>
                </select>
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-400 block">Strength</label>
                <select value={selectedConnection.strength} onChange={e => handleConnectionChange('strength', e.target.value)} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600">
                    <option value="normal">Normal</option>
                    <option value="strong">Strong</option>
                </select>
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-400 block mb-2">Style</label>
                <div className="grid grid-cols-3 gap-2">
                    <StyleButton label="Solid" style="solid" currentStyle={selectedConnection.style} onClick={(s) => handleConnectionChange('style', s)} />
                    <StyleButton label="Dashed" style="dashed" currentStyle={selectedConnection.style} onClick={(s) => handleConnectionChange('style', s)} />
                    <StyleButton label="Dotted" style="dotted" currentStyle={selectedConnection.style} onClick={(s) => handleConnectionChange('style', s)} />
                </div>
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-400 block">Description (for hover)</label>
                <textarea value={selectedConnection.description} onChange={e => handleConnectionChange('description', e.target.value)} rows={4} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600"></textarea>
            </div>
            <button onClick={() => onConnectionDelete(selectedConnection.id)} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md bg-red-800/80 hover:bg-red-700 terminal-button">
                <TrashIcon className="w-4 h-4" /> Delete Connection
            </button>
        </div>
    );
    
    const renderScenarioProperties = () => (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-semibold text-gray-400 block">Scenario Name</label>
                <input type="text" value={scenarioName} onChange={e => onScenarioNameChange(e.target.value)} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600" />
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-400 block">Description</label>
                <textarea value={scenarioDescription} onChange={e => onScenarioDescriptionChange(e.target.value)} rows={5} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600"></textarea>
            </div>
        </div>
    );
    
    const getTitle = () => {
        if (selectedNode) return 'Role Properties';
        if (selectedConnection) return 'Connection Properties';
        return 'Scenario Properties';
    }

    return (
        <aside className="w-72 flex-shrink-0 p-4 border-l flex flex-col" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider mb-4">{getTitle()}</h2>
            <div className="flex-1 overflow-y-auto animate-fade-in">
                {selectedNode ? renderNodeProperties() : 
                 selectedConnection ? renderConnectionProperties() : 
                 renderScenarioProperties()}
            </div>
        </aside>
    );
};

const AIGenerationModal: React.FC<{
    onClose: () => void;
    onAddRoles: (roles: GeneratedRoleIdea[]) => void;
    existingRoles: Role[];
}> = ({ onClose, onAddRoles, existingRoles }) => {
    const [theme, setTheme] = useState('');
    const [playerCount, setPlayerCount] = useState({ min: 7, max: 15 });
    const [mechanics, setMechanics] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedResponse, setGeneratedResponse] = useState<{ roles: GeneratedRoleIdea[], mechanic: string} | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedResponse(null);
        try {
            const response = await generateScenarioIdeas(existingRoles, theme, playerCount, mechanics);
            if(response) {
                setGeneratedResponse({
                    roles: response.new_roles,
                    mechanic: response.mechanic_suggestion
                });
            } else {
                alert('AI generation failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during AI generation.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
            <div className="border rounded-lg shadow-xl w-full max-w-2xl flex flex-col" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)'}}>
                <header className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)'}}>
                    <h2 className="text-xl font-bold font-orbitron">AI-Powered Scenario Generation</h2>
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 terminal-button">&times;</button>
                </header>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {!generatedResponse ? (
                    <>
                        <div>
                            <label className="text-sm font-semibold text-gray-400 block">Theme / Concept</label>
                            <input type="text" value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g., Cyberpunk, Eldritch Horror" className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-400 block">Core Mechanic / Idea</label>
                            <textarea value={mechanics} onChange={e => setMechanics(e.target.value)} placeholder="e.g., A day phase where voting is anonymous" rows={3} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600"></textarea>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-gray-400 block">Min Players</label>
                                <input type="number" value={playerCount.min} onChange={e => setPlayerCount(p => ({...p, min: parseInt(e.target.value, 10)}))} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600" />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-gray-400 block">Max Players</label>
                                <input type="number" value={playerCount.max} onChange={e => setPlayerCount(p => ({...p, max: parseInt(e.target.value, 10)}))} className="w-full p-2 mt-1 rounded-md bg-gray-800 border border-gray-600" />
                            </div>
                        </div>
                    </>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-lg font-bold text-secondary">Generated Ideas</h3>
                            <div>
                                <h4 className="font-semibold mb-2">New Roles:</h4>
                                <div className="space-y-3">
                                {generatedResponse.roles.map((role, i) => (
                                    <div key={i} className="p-3 border rounded-md bg-gray-800/50" style={{borderColor: 'var(--color-border)'}}>
                                        <p className="font-bold">{role.name} <span className="text-sm font-mono text-gray-400">({role.team})</span></p>
                                        <p className="text-sm text-gray-300 mt-1">{role.description}</p>
                                    </div>
                                ))}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2">Mechanic Suggestion:</h4>
                                <p className="text-sm p-3 border rounded-md bg-gray-800/50" style={{borderColor: 'var(--color-border)'}}>{generatedResponse.mechanic}</p>
                            </div>
                        </div>
                    )}
                </div>
                <footer className="p-4 border-t flex justify-end gap-4" style={{ borderColor: 'var(--color-border)'}}>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-600 hover:bg-gray-500 terminal-button">Close</button>
                    {generatedResponse ? (
                         <button onClick={() => { onAddRoles(generatedResponse.roles); onClose(); }} className="px-4 py-2 text-sm font-semibold rounded-md bg-green-600 hover:bg-green-500 terminal-button">
                           Add Roles & Close
                        </button>
                    ) : (
                         <button onClick={handleGenerate} disabled={isLoading} className="px-4 py-2 text-sm font-semibold rounded-md bg-[#00FF88] text-black hover:bg-opacity-80 flex items-center gap-2 disabled:bg-gray-500 terminal-button">
                            {isLoading ? <><SpinnerIcon className="w-4 h-4" /> Generating...</> : 'Generate Ideas'}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ScriptRiterScene;