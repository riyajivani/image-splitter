import { CanvasEditor } from './components/CanvasEditor';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { Toolbar } from './components/Toolbar';
import { PreviewModal } from './components/PreviewModal';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Toolbar />
      <div className="main-content">
        <LeftPanel />
        <CanvasEditor />
        <RightPanel />
      </div>
      <PreviewModal />
    </div>
  );
}

export default App;
