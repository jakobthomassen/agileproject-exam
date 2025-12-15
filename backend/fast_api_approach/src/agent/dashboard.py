from ..DTOs.eventstate import EventState
import time
import datetime

"""
Dashboard renderer for AI system prompt.
Converts EventState to markdown-formatted dashboard view.
"""

class Dashboard:
    @staticmethod
    def render(EventState: EventState) -> str:
       """
        Takes the raw state object and converts it into a 
        Markdown-formatted dashboard for the AI System Prompt.
        """
       data = EventState.model_dump()
       missing = EventState.missing_fields()
       
       # Check for recommended fields that are missing
       recommended_fields = []
       if not data.get('eventdate'):
           recommended_fields.append('date')
       if not data.get('eventtime'):
           recommended_fields.append('time')
       if not data.get('eventlocation'):
           recommended_fields.append('location')
       if not data.get('eventdescription'):
           recommended_fields.append('description')
       if not data.get('eventjudgetype'):
           recommended_fields.append('judging_type')
       
       if missing:
           action = f"CRITICAL: Ask for required field: {missing[0]}. After that, collect recommended fields: {', '.join(recommended_fields[:2]) if recommended_fields else 'none'}."
           status = "Incomplete - Missing Required Fields"
       elif recommended_fields:
           action = f"Required fields complete. Continue collecting recommended fields: {', '.join(recommended_fields[:2])}. Ask for one at a time."
           status = "Partially Complete - Collecting Recommended Fields"
       else:
           action = "All event details are complete. The event has been saved in the database, stand by for changes or new event creation."
           status = "Complete"
       
       dashboard_text = f"""
        
        # ================= LIVE SYSTEM DASHBOARD =================
        # Dashboard section for AI system prompt context
        # Date and time now: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        ### CURRENT DATA
        - Name:         {data.get('eventname') or 'Not set'}
        - Date:         {data.get('eventdate') or 'Not set'}
        - Time:         {data.get('eventtime') or 'Not set'}
        - Location:     {data.get('eventlocation') or 'Not set'}
        - Description:  {data.get('eventdescription') or 'Not set'}
        - Judging Type: {data.get('eventjudgetype') or 'Not set'}
        - Audience Wt:  {data.get('eventaudienceweight') or 'Not set'}
        - Expert Wt:    {data.get('eventexpertweight') or 'Not set'}
        - Athlete Wt:   {data.get('eventathleteweight') or 'Not set'}
        - End Date:     {data.get('eventenddate') or 'Not set'}
        - End Time:     {data.get('eventendtime') or 'Not set'}
        
        ### STATUS
        {status}
        Missing Required Fields: {missing}
        
        ### RECOMMENDED FIELDS (not required but should collect)
        Recommended fields to ask for (if missing): date, time, location, description, judging_type
        
        ### INSTRUCTION
        {action}
        
        # =========================================================
        """
        
       return dashboard_text