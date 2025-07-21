import random

# Sample DApp database (expand with real data)
dapps = {
    "DApp1": {"security_score": 0.9, "category": "DeFi"},
    "DApp2": {"security_score": 0.85, "category": "Gaming"},
    "DApp3": {"security_score": 0.95, "category": "NFT"}
}

def suggest_dapp(user_behavior="DeFi"):
    # Filter DApps based on user behavior (simplified)
    filtered_dapps = [dapp for dapp in dapps if dapps[dapp]["security_score"] > 0.8 and dapps[dapp]["category"] == user_behavior]
    if not filtered_dapps:
        return random.choice(list(dapps.keys()))
    return random.choice(filtered_dapps)

# Example usage
if __name__ == "__main__":
    user_preference = input("Enter preferred category (DeFi, Gaming, NFT): ")
    suggested_dapp = suggest_dapp(user_preference)
    print(f"Suggested DApp: {suggested_dapp} (Security Score: {dapps[suggested_dapp]['security_score']})")
