Deployed contract = https://rinkeby.etherscan.io/address/0x2b9439D460a6c40976bA7e4AD505670De017f722 Graph Protocol subgraph = https://thegraph.com/hosted-service/subgraph/oksmoke21/web3-blog

Web3 Blog- This is a web3 application in which the user can run their immutable blog on the blockchain. Only the contract deployer can add new posts and edit them. The project is deployed on Graph protocol allowing anybody to run queries on the contract and retrieve data such as searching posts by id/text/date, text search, sorting posts, and more.

Steps to deploy-

1. Download the code into a local folder.
2. Set the required environment variables.
3. Run npm install to add dependency libraries.
4. Configure your preferred network in hardhat.config.js and the js files in the 'pages' folder
5. Run command: 'npm run build' to create production build.
6. Run command: 'npm run dev' to run app in development mode or 'npm start' to run it in production mode.
7. Click on the 'Connect' button to connect your MetaMask wallet to the app with the same account through which the contract was deployed. Only then is the 'Create your first post' button visible.
