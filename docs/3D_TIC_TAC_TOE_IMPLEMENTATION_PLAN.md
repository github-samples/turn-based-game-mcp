# 3D Tic Tac Toe Implementation Plan

## Overview
This plan introduces a 3D visualization for Tic Tac Toe using `react-three-fiber`. Users can toggle between the classic 2D grid and an interactive 3D scene where they can rotate the board, see hover effects, and enjoy celebratory effects when winning.

## Implementation Steps

### 1. Install 3D Dependencies
Install the latest versions of required 3D libraries in the `web` workspace:

```bash
cd web
npm install three@^0.170.0 @react-three/fiber@^9.0.0 @react-three/drei@^10.0.0 @react-three/cannon@^6.6.0
```

**Dependencies:**
- `three` - Core Three.js library for 3D rendering
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Helper components and abstractions for react-three-fiber
- `@react-three/cannon` - Physics and effects for celebratory animations

---

### 2. Create 3D Board Component
**File:** `web/src/components/games/TicTacToeBoard3D.tsx`

**Requirements:**
- Implement the `TicTacToeBoardProps` interface from `TicTacToeBoard.tsx`
- Accept the same props: `gameState`, `onMove`, `disabled`
- Maintain functional parity with the 2D board component

**Component Structure:**
```typescript
interface TicTacToeBoardProps {
  gameState: TicTacToeGameState
  onMove: (move: TicTacToeMove) => void
  disabled?: boolean
}

export function TicTacToeBoard3D({ gameState, onMove, disabled }: TicTacToeBoardProps) {
  // Implementation
}
```

---

### 3. Implement 3D Scene
**Canvas Setup:**
- Use `<Canvas>` component from `@react-three/fiber`
- Configure `OrbitControls` from `@react-three/drei` for rotation and zoom
- Set isometric camera position: `position={[5, 5, 5]}` with `lookAt={[0, 0, 0]}`
- Allow user to rotate and zoom but maintain clear view of the board

**3x3 Grid Implementation:**
- Create 9 interactive mesh cells positioned in a 3x3 grid
- Each cell should be a clickable 3D object
- Use raycasting for click detection via `onClick` handlers
- Implement hover effects via `onPointerOver` and `onPointerOut`

**Interaction Model:**
- Raycasting automatically handled by react-three-fiber's event system
- Each valid cell should respond to:
  - `onClick` - trigger `onMove({ row, col })`
  - `onPointerOver` - show hover highlight
  - `onPointerOut` - remove hover highlight
- Disable interactions when `disabled={true}` or cell is occupied

---

### 4. Add Visual Feedback

**Hover States:**
- Highlight valid cells on hover (e.g., subtle glow or color change)
- Only show hover effect on empty cells when it's the player's turn
- No hover effect during AI turns or on occupied cells

**Disabled State During AI Turns:**
- Show overlay or dim the board when `disabled={true}`
- Display "AI's Turn" indicator
- Prevent all click interactions

**Turn Indicator:**
- Display current turn above the board
- Options:
  - Use `<Html>` component from `@react-three/drei` for HTML overlay
  - OR use 3D text mesh
- Show "Your turn (X)" or "AI thinking... (O)"

**Win Celebration Effect:**
- Trigger confetti/particle effect when game is won
- Use `<Sparkles>` from `@react-three/drei` or similar
- Consider using `@react-three/cannon` for more dynamic effects
- Effect should be visible but not obstruct the final board state

---

### 5. Update GameControls Component
**File:** `web/src/components/ui/GameControls.tsx`

**Changes:**
- Add new optional prop: `onViewToggle?: () => void`
- Add new optional prop: `is3DMode?: boolean`
- Render toggle button when `onViewToggle` is provided
- Button text should indicate current mode: "Switch to 3D View" or "Switch to 2D Grid"

**Example Button:**
```tsx
{onViewToggle && (
  <button onClick={onViewToggle}>
    {is3DMode ? '2D Grid' : '3D View'}
  </button>
)}
```

**Placement:**
- Add button to the controls panel alongside "New Game" and "Delete" buttons
- Maintain consistent styling with existing buttons

---

### 6. Update Tic Tac Toe Page
**File:** `web/src/app/games/tic-tac-toe/page.tsx`

**State Management:**
- Add new state: `const [is3DMode, setIs3DMode] = useState<boolean>(false)`
- Initialize from localStorage on mount
- Persist to localStorage on toggle

**localStorage Integration:**
```typescript
// On mount
useEffect(() => {
  const saved = localStorage.getItem('ticTacToe_view3D')
  if (saved !== null) {
    setIs3DMode(saved === 'true')
  }
}, [])

// On toggle
const handleViewToggle = () => {
  setIs3DMode(prev => {
    const newValue = !prev
    localStorage.setItem('ticTacToe_view3D', String(newValue))
    return newValue
  })
}
```

**Conditional Rendering:**
```tsx
const gameBoard = is3DMode ? (
  <TicTacToeBoard3D
    gameState={gameSession.gameState}
    onMove={makeMove}
    disabled={isLoading || gameSession.gameState.currentPlayerId === 'ai'}
  />
) : (
  <TicTacToeBoard
    gameState={gameSession.gameState}
    onMove={makeMove}
    disabled={isLoading || gameSession.gameState.currentPlayerId === 'ai'}
  />
)
```

**Pass Props to GameControls:**
```tsx
<GameControls 
  isLoading={isLoading}
  onNewGame={() => startNewGame()}
  onDelete={() => handleDeleteGame(gameSession.gameState.id)}
  onViewToggle={handleViewToggle}
  is3DMode={is3DMode}
  showDelete={true}
/>
```

**Memory Leak Prevention:**
- Ensure proper cleanup when toggling views
- Canvas should unmount cleanly
- Three.js resources should be disposed properly
- react-three-fiber handles most cleanup automatically, but verify no lingering references

---

## Technical Specifications

### Geometries for Game Symbols

**Cell Base:**
- `BoxGeometry` for the clickable cell surface
- Material: Semi-transparent when empty, solid when occupied
- Dimensions: Appropriate spacing for 3x3 grid

**X Symbol:**
- Two `CylinderGeometry` meshes arranged in an X pattern
- Rotate cylinders 45° and -45° to form cross
- Color: Blue (matching 2D version)

**O Symbol:**
- `TorusGeometry` for circular ring
- Color: Red (matching 2D version)

### Camera Configuration
- **Position:** `[5, 5, 5]` (isometric view)
- **LookAt:** `[0, 0, 0]` (center of board)
- **Controls:** `OrbitControls` with:
  - Enable rotate: `true`
  - Enable zoom: `true`
  - Enable pan: `false` (optional)
  - Min/max distance limits to prevent extreme zoom

### Performance Considerations
- Desktop-first optimization (no mobile-specific handling in MVP)
- Keep geometry complexity low for smooth 60fps
- Use instanced meshes if performance issues arise
- Proper disposal of Three.js resources on unmount

### Accessibility Notes
- 3D mode is optional; 2D mode remains fully functional
- Toggle is clearly labeled in sidebar
- Preference persists across page refreshes
- No keyboard navigation in 3D mode for MVP (future enhancement)

---

## Testing Strategy (Post-MVP)
- Manual testing for MVP
- Future considerations:
  - Mock Three.js for unit tests
  - Visual regression testing for 3D rendering
  - Performance benchmarks
  - Test localStorage persistence

---

## localStorage Schema
**Key:** `ticTacToe_view3D`  
**Value:** `"true"` or `"false"` (string representation of boolean)  
**Scope:** Per-browser, persists across page refreshes for the same game type

---

## File Structure Summary
```
web/
├── src/
│   ├── components/
│   │   ├── games/
│   │   │   ├── TicTacToeBoard.tsx (existing)
│   │   │   └── TicTacToeBoard3D.tsx (NEW)
│   │   └── ui/
│   │       └── GameControls.tsx (MODIFY)
│   └── app/
│       └── games/
│           └── tic-tac-toe/
│               └── page.tsx (MODIFY)
└── package.json (MODIFY - add dependencies)
```

---

## Dependencies Impact
**New packages added to `web/package.json`:**
- `three@^0.170.0`
- `@react-three/fiber@^9.0.0`
- `@react-three/drei@^10.0.0`
- `@react-three/cannon@^6.6.0`

**Bundle size impact:** ~500KB (Three.js core + react-three libraries)

---

## Success Criteria
- [x] User can toggle between 2D and 3D views via sidebar button
- [x] 3D view renders a rotatable 3x3 Tic Tac Toe board
- [x] Clicking cells in 3D works identically to 2D
- [x] Hover effects show which cells are clickable
- [x] AI turn disables the board with visual feedback
- [x] Turn indicator shows current player above board
- [x] Win condition triggers celebratory effect in 3D
- [x] View preference persists across page refreshes
- [x] No memory leaks when toggling between views
- [x] Existing 2D functionality remains unchanged

---

## Future Enhancements (Out of Scope for MVP)
- Mobile/touch optimization
- Keyboard navigation in 3D mode
- Custom camera presets (top-down, side view, etc.)
- Animation transitions when placing symbols
- Sound effects
- Multiple 3D themes/skins
- Unit and integration tests for 3D components
