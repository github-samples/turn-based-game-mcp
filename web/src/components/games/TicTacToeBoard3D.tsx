'use client'

/* eslint-disable react/no-unknown-property */

import { useState, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sparkles } from '@react-three/drei'
import type { TicTacToeGameState, TicTacToeMove, CellValue } from '@turn-based-mcp/shared'

/**
 * Props for the TicTacToeBoard3D component
 */
interface TicTacToeBoardProps {
  /** Current state of the tic-tac-toe game */
  gameState: TicTacToeGameState
  /** Callback function called when a player makes a move */
  onMove: (move: TicTacToeMove) => void
  /** Whether the board should be disabled (e.g., during AI turn) */
  disabled?: boolean
}

/**
 * 3D cell component for the game board
 */
function Cell({ 
  value, 
  row, 
  col, 
  onClick, 
  isClickable 
}: { 
  value: CellValue
  row: number
  col: number
  onClick: () => void
  isClickable: boolean
}) {
  const [hovered, setHovered] = useState(false)
  
  const position: [number, number, number] = [
    (col - 1) * 1.2,
    0,
    (row - 1) * 1.2
  ]

  return (
    <group position={position}>
      {/* Cell base */}
      <mesh
        onClick={isClickable ? onClick : undefined}
        onPointerOver={() => isClickable && setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial 
          color={hovered ? '#60a5fa' : (value ? '#cbd5e1' : '#e2e8f0')}
          transparent
          opacity={value ? 0.9 : 0.6}
        />
      </mesh>

      {/* X symbol */}
      {value === 'X' && (
        <group position={[0, 0.3, 0]}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <mesh rotation={[0, -Math.PI / 4, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        </group>
      )}

      {/* O symbol */}
      {value === 'O' && (
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.35, 0.05, 16, 32]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      )}
    </group>
  )
}

/**
 * 3D scene containing the game board
 */
function Scene({ 
  gameState, 
  onMove, 
  disabled 
}: TicTacToeBoardProps) {
  const handleCellClick = useCallback((row: number, col: number) => {
    if (disabled || gameState.board[row][col] !== null || gameState.status === 'finished') {
      return
    }
    onMove({ row, col })
  }, [disabled, gameState.board, gameState.status, onMove])

  const cells = useMemo(() => {
    const result = []
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const value = gameState.board[row][col]
        const isClickable = !disabled && value === null && gameState.status === 'playing'
        result.push(
          <Cell
            key={`${row}-${col}`}
            value={value}
            row={row}
            col={col}
            onClick={() => handleCellClick(row, col)}
            isClickable={isClickable}
          />
        )
      }
    }
    return result
  }, [gameState.board, disabled, gameState.status, handleCellClick])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      
      {cells}
      
      {/* Win celebration effect */}
      {gameState.status === 'finished' && gameState.winner !== 'draw' && (
        <Sparkles
          count={50}
          scale={5}
          size={3}
          speed={0.5}
          opacity={0.6}
          color={gameState.winner === 'player1' ? '#3b82f6' : '#ef4444'}
        />
      )}

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

/**
 * Interactive 3D Tic-Tac-Toe game board component
 * 
 * Renders a 3x3 grid in 3D that players can interact with.
 * Displays current game state with rotatable camera view.
 * Includes visual feedback for AI turns and game completion.
 * 
 * @param props - Component props
 * @returns JSX element representing the 3D game board
 */
export function TicTacToeBoard3D({ gameState, onMove, disabled }: TicTacToeBoardProps) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 relative">
      {disabled && gameState.currentPlayerId === 'ai' && gameState.status === 'playing' && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              🤖 AI&apos;s Turn - Board Locked
            </p>
          </div>
        </div>
      )}

      <div className="w-full h-[500px] mb-4">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          onCreated={({ camera }) => {
            camera.lookAt(0, 0, 0)
          }}
        >
          <Scene gameState={gameState} onMove={onMove} disabled={disabled} />
        </Canvas>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {gameState.status === 'playing' && (
            <>
              Current turn: {' '}
              <span className="font-semibold">
                {gameState.currentPlayerId === 'player1' ? 'Your turn (X)' : 'AI thinking... (O)'}
              </span>
            </>
          )}
          {gameState.status === 'finished' && gameState.winner && (
            <span className="font-semibold text-lg">
              {gameState.winner === 'player1' && 'You won! 🎉'}
              {gameState.winner === 'ai' && 'AI won! 🤖'}
              {gameState.winner === 'draw' && "It's a draw! 🤝"}
            </span>
          )}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          💡 Click and drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  )
}
