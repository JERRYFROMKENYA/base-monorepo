import os
from dotenv import load_dotenv
from app.util.talos_vector_database_engine import initialize
from app import app
if __name__ == '__main__':
    # Load environment variables from .env file
    load_dotenv()
    # initialize()
    app.run(debug=True)
