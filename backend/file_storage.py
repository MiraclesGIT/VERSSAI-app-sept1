"""
File-based storage for VERSSAI when PostgreSQL is not available
This provides a fallback storage mechanism for deck uploads and analysis results
"""
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class FileBasedStorage:
    """File-based storage for VERSSAI data when PostgreSQL is unavailable"""
    
    def __init__(self, storage_path: str = "./data"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)
        
        # Create subdirectories
        self.decks_path = self.storage_path / "decks"
        self.extractions_path = self.storage_path / "extractions"
        self.signals_path = self.storage_path / "signals"
        self.workflows_path = self.storage_path / "workflows"
        self.data_rooms_path = self.storage_path / "data_rooms"
        self.dd_reports_path = self.storage_path / "dd_reports"
        
        for path in [self.decks_path, self.extractions_path, self.signals_path, 
                     self.workflows_path, self.data_rooms_path, self.dd_reports_path]:
            path.mkdir(exist_ok=True)
    
    def save_deck(self, deck_data: Dict[str, Any]) -> str:
        """Save deck information to file"""
        try:
            deck_id = str(uuid.uuid4())
            deck_data['deck_id'] = deck_id
            deck_data['upload_date'] = datetime.utcnow().isoformat()
            deck_data['created_at'] = datetime.utcnow().isoformat()
            deck_data['updated_at'] = datetime.utcnow().isoformat()
            
            deck_file = self.decks_path / f"{deck_id}.json"
            with open(deck_file, 'w') as f:
                json.dump(deck_data, f, indent=2, default=str)
            
            logger.info(f"Saved deck {deck_id} to file storage")
            return deck_id
            
        except Exception as e:
            logger.error(f"Error saving deck: {e}")
            raise
    
    def get_deck(self, deck_id: str) -> Optional[Dict[str, Any]]:
        """Get deck information from file"""
        try:
            deck_file = self.decks_path / f"{deck_id}.json"
            if deck_file.exists():
                with open(deck_file, 'r') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Error getting deck {deck_id}: {e}")
            return None
    
    def update_deck_status(self, deck_id: str, status: str) -> bool:
        """Update deck status"""
        try:
            deck_data = self.get_deck(deck_id)
            if deck_data:
                deck_data['status'] = status
                deck_data['updated_at'] = datetime.utcnow().isoformat()
                
                deck_file = self.decks_path / f"{deck_id}.json"
                with open(deck_file, 'w') as f:
                    json.dump(deck_data, f, indent=2, default=str)
                
                return True
            return False
        except Exception as e:
            logger.error(f"Error updating deck status: {e}")
            return False
    
    # Due Diligence Data Room Methods
    
    def save_data_room(self, data_room_id: str, data_room_data: Dict[str, Any]) -> str:
        """Save data room information to file"""
        try:
            data_room_data['data_room_id'] = data_room_id
            data_room_data['created_at'] = datetime.utcnow().isoformat()
            data_room_data['updated_at'] = datetime.utcnow().isoformat()
            
            data_room_file = self.data_rooms_path / f"{data_room_id}.json"
            with open(data_room_file, 'w') as f:
                json.dump(data_room_data, f, indent=2, default=str)
            
            logger.info(f"Saved data room {data_room_id} to file storage")
            return data_room_id
            
        except Exception as e:
            logger.error(f"Error saving data room: {e}")
            raise
    
    def get_data_room(self, data_room_id: str) -> Optional[Dict[str, Any]]:
        """Get data room information from file"""
        try:
            data_room_file = self.data_rooms_path / f"{data_room_id}.json"
            if data_room_file.exists():
                with open(data_room_file, 'r') as f:
                    return json.load(f)
            return None
            
        except Exception as e:
            logger.error(f"Error getting data room {data_room_id}: {e}")
            return None
    
    def get_all_data_rooms(self, limit: int = 50, offset: int = 0, 
                          status: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all data rooms with pagination and optional status filtering"""
        try:
            data_rooms = []
            
            for data_room_file in self.data_rooms_path.glob("*.json"):
                try:
                    with open(data_room_file, 'r') as f:
                        data_room = json.load(f)
                        
                    # Filter by status if provided
                    if status and data_room.get('status') != status:
                        continue
                        
                    # Add summary info only
                    data_room_summary = {
                        'data_room_id': data_room.get('data_room_id'),
                        'company_name': data_room.get('company_name'),
                        'status': data_room.get('status'),
                        'total_files': data_room.get('total_files', 0),
                        'upload_timestamp': data_room.get('upload_timestamp'),
                        'uploaded_by': data_room.get('uploaded_by')
                    }
                    data_rooms.append(data_room_summary)
                    
                except Exception as e:
                    logger.error(f"Error reading data room file {data_room_file}: {e}")
                    continue
            
            # Sort by upload timestamp (newest first)
            data_rooms.sort(key=lambda x: x.get('upload_timestamp', ''), reverse=True)
            
            # Apply pagination
            start = offset
            end = offset + limit
            return data_rooms[start:end]
            
        except Exception as e:
            logger.error(f"Error getting all data rooms: {e}")
            return []
    
    def update_data_room_status(self, data_room_id: str, status: str):
        """Update data room status"""
        try:
            data_room_file = self.data_rooms_path / f"{data_room_id}.json"
            if data_room_file.exists():
                with open(data_room_file, 'r') as f:
                    data_room = json.load(f)
                
                data_room['status'] = status
                data_room['updated_at'] = datetime.utcnow().isoformat()
                
                with open(data_room_file, 'w') as f:
                    json.dump(data_room, f, indent=2, default=str)
                
                logger.info(f"Updated data room {data_room_id} status to {status}")
            
        except Exception as e:
            logger.error(f"Error updating data room status: {e}")
    
    def save_dd_report(self, data_room_id: str, dd_report: Any):
        """Save due diligence report to file"""
        try:
            # Convert dataclass or object to dict if needed
            if hasattr(dd_report, '__dict__'):
                report_data = self._serialize_dd_report(dd_report)
            else:
                report_data = dd_report
            
            report_file = self.dd_reports_path / f"{data_room_id}_report.json"
            with open(report_file, 'w') as f:
                json.dump(report_data, f, indent=2, default=str)
            
            logger.info(f"Saved DD report for data room {data_room_id}")
            
        except Exception as e:
            logger.error(f"Error saving DD report: {e}")
    
    def get_dd_report(self, data_room_id: str) -> Optional[Any]:
        """Get due diligence report from file"""
        try:
            report_file = self.dd_reports_path / f"{data_room_id}_report.json"
            if report_file.exists():
                with open(report_file, 'r') as f:
                    report_data = json.load(f)
                
                # Convert back to DueDiligenceReport-like object
                return self._deserialize_dd_report(report_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting DD report {data_room_id}: {e}")
            return None
    
    def _serialize_dd_report(self, dd_report) -> Dict[str, Any]:
        """Convert DueDiligenceReport object to serializable dict"""
        try:
            return {
                'company_id': dd_report.company_id,
                'company_name': dd_report.company_name,
                'analysis_timestamp': dd_report.analysis_timestamp,
                'document_analyses': [
                    {
                        'document_id': doc.document_id,
                        'filename': doc.filename,
                        'document_type': doc.document_type,
                        'category': doc.category,
                        'key_insights': doc.key_insights,
                        'risk_factors': doc.risk_factors,
                        'completeness_score': doc.completeness_score,
                        'credibility_score': doc.credibility_score,
                        'red_flags': doc.red_flags,
                        'summary': doc.summary,
                        'extracted_data': doc.extracted_data
                    }
                    for doc in dd_report.document_analyses
                ],
                'cross_document_insights': dd_report.cross_document_insights,
                'overall_risk_assessment': dd_report.overall_risk_assessment,
                'completeness_assessment': dd_report.completeness_assessment,
                'red_flags': dd_report.red_flags,
                'recommendations': dd_report.recommendations,
                'checklist_status': dd_report.checklist_status,
                'overall_score': dd_report.overall_score
            }
        except Exception as e:
            logger.error(f"Error serializing DD report: {e}")
            return dd_report if isinstance(dd_report, dict) else {}
    
    def _deserialize_dd_report(self, report_data: Dict[str, Any]):
        """Convert serialized dict back to DueDiligenceReport-like object"""
        # For simplicity, return a mock object with attributes
        class MockDDReport:
            def __init__(self, data):
                for key, value in data.items():
                    setattr(self, key, value)
        
        return MockDDReport(report_data)
    
    def get_all_decks(self, limit: int = 50, offset: int = 0, status: str = None) -> List[Dict[str, Any]]:
        """Get all decks with pagination and filtering"""
        try:
            decks = []
            
            for deck_file in sorted(self.decks_path.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
                try:
                    with open(deck_file, 'r') as f:
                        deck_data = json.load(f)
                    
                    if status is None or deck_data.get('status') == status:
                        decks.append(deck_data)
                        
                except Exception as e:
                    logger.error(f"Error reading deck file {deck_file}: {e}")
                    continue
            
            # Apply pagination
            start_idx = offset
            end_idx = offset + limit
            return decks[start_idx:end_idx]
            
        except Exception as e:
            logger.error(f"Error getting all decks: {e}")
            return []
    
    def save_extraction(self, deck_id: str, extraction_data: Dict[str, Any]) -> str:
        """Save extraction results"""
        try:
            extraction_id = str(uuid.uuid4())
            extraction_data['extraction_id'] = extraction_id
            extraction_data['deck_id'] = deck_id
            extraction_data['extracted_at'] = datetime.utcnow().isoformat()
            
            extraction_file = self.extractions_path / f"{extraction_id}.json"
            with open(extraction_file, 'w') as f:
                json.dump(extraction_data, f, indent=2, default=str)
            
            logger.info(f"Saved extraction {extraction_id} for deck {deck_id}")
            return extraction_id
            
        except Exception as e:
            logger.error(f"Error saving extraction: {e}")
            raise
    
    def save_founder_signal(self, deck_id: str, signal_data: Dict[str, Any]) -> str:
        """Save founder signal analysis"""
        try:
            signal_id = str(uuid.uuid4())
            signal_data['signal_id'] = signal_id
            signal_data['deck_id'] = deck_id
            signal_data['created_at'] = datetime.utcnow().isoformat()
            
            signal_file = self.signals_path / f"{signal_id}.json"
            with open(signal_file, 'w') as f:
                json.dump(signal_data, f, indent=2, default=str)
            
            logger.info(f"Saved founder signal {signal_id} for deck {deck_id}")
            return signal_id
            
        except Exception as e:
            logger.error(f"Error saving founder signal: {e}")
            raise
    
    def get_founder_signals(self, deck_id: str) -> List[Dict[str, Any]]:
        """Get founder signals for a deck"""
        try:
            signals = []
            
            for signal_file in self.signals_path.glob("*.json"):
                try:
                    with open(signal_file, 'r') as f:
                        signal_data = json.load(f)
                    
                    if signal_data.get('deck_id') == deck_id:
                        signals.append(signal_data)
                        
                except Exception as e:
                    logger.error(f"Error reading signal file {signal_file}: {e}")
                    continue
            
            return signals
            
        except Exception as e:
            logger.error(f"Error getting founder signals: {e}")
            return []
    
    def save_workflow_result(self, workflow_id: str, workflow_data: Dict[str, Any]) -> bool:
        """Save workflow execution results"""
        try:
            workflow_data['workflow_id'] = workflow_id
            workflow_data['saved_at'] = datetime.utcnow().isoformat()
            
            workflow_file = self.workflows_path / f"{workflow_id}.json"
            with open(workflow_file, 'w') as f:
                json.dump(workflow_data, f, indent=2, default=str)
            
            logger.info(f"Saved workflow result {workflow_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving workflow result: {e}")
            return False
    
    def get_workflow_result(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get workflow execution results"""
        try:
            workflow_file = self.workflows_path / f"{workflow_id}.json"
            if workflow_file.exists():
                with open(workflow_file, 'r') as f:
                    return json.load(f)
            return None
        except Exception as e:
            logger.error(f"Error getting workflow result: {e}")
            return None

# Global file storage instance
file_storage = FileBasedStorage()

# Helper functions
def save_deck_to_file(deck_data: Dict[str, Any]) -> str:
    """Save deck data to file storage"""
    return file_storage.save_deck(deck_data)

def get_deck_from_file(deck_id: str) -> Optional[Dict[str, Any]]:
    """Get deck data from file storage"""
    return file_storage.get_deck(deck_id)