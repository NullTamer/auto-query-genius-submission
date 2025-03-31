
import React, { useEffect, useRef, useState } from "react";
import { KeywordItem } from "@/components/evaluation/types";
import { getTermRelationships } from "@/utils/transformerExtraction";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Network, Brain, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import * as d3 from "d3";

type Node = {
  id: string;
  group: number;
  value: number;
};

type Link = {
  source: string;
  target: string;
  value: number;
};

interface TermRelationshipMapProps {
  keywords: KeywordItem[];
}

const TermRelationshipMap: React.FC<TermRelationshipMapProps> = ({ keywords }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<Array<{source: string, target: string, strength: number}>>([]);
  const [clusters, setClusters] = useState<Record<string, string[]>>({});
  const [threshold, setThreshold] = useState(0.6);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (keywords.length === 0) {
      setIsLoading(false);
      return;
    }
    
    async function loadRelationships() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Limit to 15 keywords for performance
        const limitedKeywords = keywords.slice(0, 15);
        
        const { connections, clusters } = await getTermRelationships(limitedKeywords);
        setConnections(connections);
        setClusters(clusters);
      } catch (err) {
        console.error("Error loading term relationships:", err);
        setError(`Failed to generate relationship map: ${(err as Error).message}`);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadRelationships();
  }, [keywords]);
  
  useEffect(() => {
    if (!svgRef.current || isLoading || connections.length === 0) return;
    
    renderGraph();
  }, [connections, clusters, threshold, isLoading]);
  
  const renderGraph = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = svgRef.current?.clientWidth || 600;
    const height = svgRef.current?.clientHeight || 400;
    
    // Filter connections based on threshold
    const filteredConnections = connections.filter(c => c.strength >= threshold);
    
    // Prepare nodes and links for D3
    const nodeMap = new Map<string, number>();
    let nodeIndex = 0;
    
    connections.forEach(({ source, target }) => {
      if (!nodeMap.has(source)) nodeMap.set(source, nodeIndex++);
      if (!nodeMap.has(target)) nodeMap.set(target, nodeIndex++);
    });
    
    // Add any isolated nodes from clusters
    Object.values(clusters).flat().forEach(term => {
      if (!nodeMap.has(term)) nodeMap.set(term, nodeIndex++);
    });
    
    // Create nodes array
    const nodes: Node[] = Array.from(nodeMap.entries()).map(([id, index]) => {
      // Find which cluster this node belongs to
      let group = 0;
      Object.entries(clusters).forEach(([clusterKey, terms], idx) => {
        if (terms.includes(id)) {
          group = idx + 1;
        }
      });
      
      // Node value based on connections
      const connectionCount = filteredConnections.filter(
        c => c.source === id || c.target === id
      ).length;
      
      return {
        id,
        group,
        value: Math.max(5, connectionCount * 3 + 5) // Scale node size
      };
    });
    
    // Create links array
    const links: Link[] = filteredConnections.map(({ source, target, strength }) => ({
      source,
      target,
      value: Math.round(strength * 10) // Scale link strength
    }));
    
    // Create the force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: any) => d.value + 5));
    
    // Add links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", (d) => d.value / 2)
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6);
    
    // Create a color scale for node groups
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Add nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", (d) => d.value)
      .attr("fill", (d) => color(d.group.toString()))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);
    
    // Add labels
    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text((d) => d.id)
      .attr("font-size", 10)
      .attr("dx", 12)
      .attr("dy", 4)
      .style("pointer-events", "none");
    
    // Add title for hover effect
    node.append("title")
      .text((d) => d.id);
    
    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      
      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);
      
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });
    
    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };
  
  const handleRefresh = async () => {
    if (keywords.length === 0) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Limit to 15 keywords for performance
      const limitedKeywords = keywords.slice(0, 15);
      
      const { connections, clusters } = await getTermRelationships(limitedKeywords);
      setConnections(connections);
      setClusters(clusters);
    } catch (err) {
      console.error("Error refreshing term relationships:", err);
      setError(`Failed to generate relationship map: ${(err as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Term Relationship Map</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={handleRefresh}
                    disabled={isLoading || keywords.length === 0}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">Refresh relationships</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Label htmlFor="threshold" className="text-xs">
            Connection Strength: {Math.round(threshold * 100)}%
          </Label>
          <div className="w-32">
            <Slider
              id="threshold"
              value={[threshold]}
              min={0.3}
              max={0.9}
              step={0.05}
              onValueChange={([val]) => setThreshold(val)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-[300px] w-full bg-muted/20 rounded flex items-center justify-center">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-32 mx-auto" />
            <p className="text-xs text-muted-foreground">
              Generating relationship map...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="h-[300px] w-full bg-muted/20 rounded flex items-center justify-center">
          <div className="text-center max-w-md p-4">
            <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      ) : connections.length === 0 ? (
        <div className="h-[300px] w-full bg-muted/20 rounded flex items-center justify-center">
          <div className="text-center max-w-md p-4">
            <Network className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No relationship data available. Please extract keywords first.
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded overflow-hidden">
          <svg 
            ref={svgRef} 
            className="w-full h-[300px] bg-muted/10"
            viewBox="0 0 600 400" 
            preserveAspectRatio="xMidYMid meet"
          ></svg>
        </div>
      )}
      
      {Object.keys(clusters).length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p>Term clusters identified: {Object.keys(clusters).length}</p>
          <p>Connections: {connections.filter(c => c.strength >= threshold).length}</p>
        </div>
      )}
    </div>
  );
};

export default TermRelationshipMap;
