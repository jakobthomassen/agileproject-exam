Getting started:

= Pre-requisities =
Install Node.js https://nodejs.org/en/download

In a terminal navigate to Frontend and run:
npm install

Navigate to project root in a terminal and run:
pip install -r requirements.txt


= Starting the server =
Navigate to frontend folder in a terminal: npm run dev

Navigate to backend folder in a terminal: uvicorn app.main:app --reload

In the Vite server terminal type o -> enter to open website.


Note: If you encounter an error on the website, check the terminal where you started the uvicorn server. If anything goes wrong it's likely a missing library.

If you plan to have a file upload demo, you can create an empty .txt file. No actual data is extracted, so the content is irrelevant.



= Stopping the server =
In both command prompts press Ctrl + C to terminate each server.



TODO:
XL Create dashboard 

L lil ai guy on manual setup
L Edit button in summary list in ai setup page
L Ability to change scoring type in SetupAI and SetupManual (and dashboard)
L Adjust scoring weights in setup based on scoring type selected

M Sponsor image upload for public card showcase + Event image (also in SetupMethod.tsx + SetupSummary)
✓ M Clean up event summary
✓ M Info pop ups on SetupTemplates

✓ S Optional field for audience members allowed. To prevent more users than desired to participate (in case the code gets posted online)
✓ S Scoring type display on 'Method' page
✓ S Change Date & Time to a range (automatically cut off access)
S Decide later button logic spearated from continue button

