import os
import sys
import subprocess
import argparse

# --- CONFIGURATION ---
# ABSOLUTE Path to where you cloned the CCP repository
CCP_INSTALL_DIR = r"c:\Users\M BHUVANESWAR\OneDrive\Documents\ccp"
# ---------------------

def run_analysis(service_name, error_type, error_message):
    """
    Runs the CCP analysis engine against the current project directory.
    """
    runner_script = os.path.join(CCP_INSTALL_DIR, "ccp", "examples", "custom_project_runner.py")
    
    # Use the current directory as the repository path
    current_repo_path = os.getcwd()
    
    if not os.path.exists(runner_script):
        print(f"Error: Could not find CCP runner at: {runner_script}")
        print("Please check the CCP_INSTALL_DIR configuration at the top of this script.")
        sys.exit(1)
    
    print(f"🚀 Starting CCP Analysis on: {current_repo_path}")
    print(f"   Service: {service_name}")
    print(f"   Error:   {error_type}: {error_message}")
    print("-" * 60)
    
    # Build the command
    cmd = [
        sys.executable,  # Use the current python interpreter
        runner_script,
        "--repo", current_repo_path,
        "--service", service_name,
        "--error", error_type,
        "--message", error_message
    ]
    
    # Execute
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Analysis failed with exit code {e.returncode}")
    except KeyboardInterrupt:
        print("\n⚠️ Analysis interrupted.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Trigger CCP Analysis on this project")
    parser.add_argument("--service", default="my-service", help="Name of the service (default: my-service)")
    parser.add_argument("--error", default="UnknownError", help="Type of error (default: UnknownError)")
    parser.add_argument("--message", default="An error occurred", help="Error message")
    
    args = parser.parse_args()
    
    run_analysis(args.service, args.error, args.message)
