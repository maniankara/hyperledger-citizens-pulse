06.11.2020
   * Last Week
   * Next Week
      - TODO: Federated organisations


01.11.2020
 * Last week
   - Anoop: Test insights: works
   - Anoop: Sent mails to Min and Hritik
   - Releases, code coverage, bugs
 * Next week
   - new release: bump version in file
   - Investigate: Binary deliverables
   - hyperledger fabric as a managed service in AWS: Anoop to provide an t3a.nano
   - Fix Blog review comments
   - Multicloud managed services study: AWS, IBM cloud, Azure, Google cloud, Alibaba cloud
   - Anoop: App testing: mobile branch + commenting feature


27.10.2020
  * Last week
    - Bug fixes
    - code coverage badge: start with manual
  * Next week:
    - Anoop: App testing: mobile branch + commenting feature
    - Anoop: Test insights: insights branch
    - Anoop: Talk with Vipin/Min: Android store account
    - Anoop: Talk with Min about blog publishing
    - Start drafting the blog
    - Implement releases - On need basis automatically with minimal manual work.
    - Implement installation instructions/scripts from releases

18.10.2020
   * Last week:
      - Anoop: App testing: mobile branch
      - First start page - first user
      - PR for plan closure, with cron (node)
      - Android commenting feature
   * Next week:
      - Anoop: App testing: mobile branch + commenting feature
      - Anoop: Test insights: insights branch
      - Anoop: WebApp first start page
      - Anoop: Talk with Vipin/Min: Android store account
      - Instructions for first start page
      - Fix bugs
      - Code coverage badges
      - Functional tests
      - Blog post planning

14.10.2020
   * Last week: Meeting with DBE Core, Business Tampere
   * Next week:
      - Anoop: Talk with Vipin/Min: Android store account
      - Anoop: App testing: mobile branch
      - Anoop: Test insights: insights branch
      - Fix App bugs
      - First time admin user UI
      - App UI features - commenting features
      - light weight JS Pub sub frameworks

04.10.2020
 * Last week: Edit comment
   - Rendering chats can be a problematic, sentimental analysis
   - Apk Debugging
   
 * Next Week:
   - Insights -> report, 
   - Create a simple charts (insights) when plan is clicked. upvote/downvote, per orgs etc.
   - Add 'Insights and reports' task to the project plan to 4th phase.
   - Setup script to create 'hritik'/'admin' user to Org1
   - Anoop: Android developer account, hyperledger store?
   - TODO: Timed plan closure, check TUPAS, Federated organisations, Hard coded org1 user


27.09.2020
  * Last week: Demo: Edit button: TODO: 15 mins non-edit implementation
    - Anoop: meeting with helsinki city+markus;
  * This week:
    - Anoop: To test webapp for comments and test it
    - Anoop: To test mobile app and create bugs
    - 15 min timeout finish
    - Insights implementation
    - Functional tests with WebUI
    - Thoughts: Automatic plan closures?

20.09.2020
 * Last week: Demo: comment plans. Bug(s): 2nd plan comment didnt appear
 * This week:
    - Mobile App: pending tasks
    - Web App: fix bugs
    - Start thinking about reporting (graphs, charts etc.) and later on exporting (pdf, etc.) - 4th phase
    - Anoop: To test webapp for comments and test it
    - Anoop: To test mobile app and create bugs
    - Suggestion: Document upload func. while plan creation, thoughts? IPFS?
    - Thoughts: Federated/consortium orgs: {org1, org2}, {org3, org4}

13.09.2020
  * Last week: Demo adding comments (todo: onchain, close plan comment consolidation)
   - App: One drive for now
  * This week:
   - Complete the App
   - On-drive publish folder for download
      - TODO: Publish to android store (elastic IP)
   - Anoop: testing
   - Anoop: Publish Hyperledger labs
   - Web: TODO:
      - Time stamp
      - Edit and delete (Think about this on-chain, option1: create a timeout for edit, remove delete button)
      - Get the comment on-chain
      - Close plan should consolidate the comments
      - On-chain comment must be Anonymous user

06.09.2020
 * Last week:
   - Mobile application (flutter) - devapk ready - sign in/up, user dash board
   - Learning: stateful, routing etc.
 * This week:
   - Anoop: provide elasticip for ec2 - t3a.small
   - Anoop: test apk and raise bugs
   - Fix small things
   - Todo: create a plan by council
   - commenting on the councils proposal
   - comments:
      - Should be stored in the chain
      - Should not be visible publicly before plan closing
      - Should be visible to all after closing
      - The values are stored in apiserver's db (off-chain) and on-chain. But the sync is not ensured
      - Possible to modify my own comments before closing (implementation can be taken separately if needed)

30.08.2020
 * This week:
   - Hyperledger labs, refactor branch
   - Flutter started
   - study: npm vs yarn: no difference, so no action
   - Anoop: Less time spend on Hyperledger labs (+DCO)
 * Next week:
   - Flutter continues
   - Mobile app: Integration with API
   - Web: Have a generic user for now instead of hrithik
   - Anoop: Submit HyperledgerLabs
   - Anoop: To arrange: AWS host for backend (HF+web+api)
   
23.08.2020
 * This week:
   - Demo: User registration (user pass + cert)
 * Next week:
   - Hyperledger Labs submission: (hrithik)
      - Arch diagram
      - Some recording of e.g. of startup -> docker ps -> generate api -> browser work flow (reg -> login -> upVote/DownVote/both -> view -> logout)
      - review the proposal and add/remove contents
      - Anoop: DCO script
      - Anoop: Submit and find sponsor
   - Comments:
      - Certs encryption
      - User del -> disabled
      - Email as unique key instead of username
   - Mobile:
      - Flutter will be used
      - Started learning, templates
      - Will start something

16.08.2020
 * Status
 * Next Week:
   - Anoop: Talk to mentorship program guys about GitHub Actions account handling
   - User registration - email/password + bidirectional translation of users certs
     - Local Cookie/Storage
   - User delete/deactivation - if there is time
   - Anoop: To send some summary for fabric-ca brush-up
   - Project plan modifications:
     - Add "User Registration and fabric-ca certificate translation"
     - Modify "Setting-up functional tests and CI for API and backend"
     - Move "Writing test req." to next phase
     - Mark "Documentation" - done after moving it from phase 3->2
     - Move "Dev. mobile" from phase 2->3
   - Check how ReactJS functional tests are done
   - Start knowing more about Flutter or something similar



09.08.2020
 * Plan closing implementation - Demo
 * GitHub actions - Demo
 * Next Week:
    - Add tests
    - Attach to pull requests
    - Anoop: To check with HF what CI is recommended
    - Documentation: Add tests, contributing etc.
    - Anoop: To test and raise bugs
    - Think about making the council as a role (not always Org1)

02.08.2020
 * MongoDB - Demo
 * Next Week:
    - Plan closing implementation
    - Implementing functional tests, test only our code
    - CI - Choose a CI: Travis, Github Actions, some other free ones, also check hyperledger's own recommendations
    - Check-up call from MinYu


27.07.2020
 * Demo - Web UI. `webui` branch
 * Anoop to test webUI and raise bugs or merge
 * Next week:
   - Get DB integrated for api server for basic persistance
   - Fix bugs


19.07.2020
* Fixed Anoop's FABRIC_CFG_PATH problem
* Last week:
  - user signup and authentication - UI - demo
* next week:
  - user can: (a) vote (b) view previous votes
  - Bug fixes


12.07.2020
* From last week, user credentials <-> certificate mapping should be done in api server.
* Discuss about the release 0.1, what needs to be included, timeline etc.
* Final submission - blog, white paper etc.
* Try to deploy our solution on atleast 1 cloud vendor with HF managed service
* Last week:
  - Discussed about the release 0.1
* Plans for next week:
  - ReactJS + nodeJS - WebUI
  - Connect WebUI <-> API server
  - Bug fixes


05.07.2020
* Demoed API server, upvote, downvote etc. excellent !
* User/password/token system needs to be discussed before deciding
* Plans for next week:
  - Start thinking about WebUI
  - CouchDB integration for storing credentials
  - Anoop to get back how to map user credentials and hypledger certificates

28.06.2020
* Completed tasks
* Discussed about API server in between client and Ledger network
  - API server can be implemented with any framework: node, golang(http), ruby on rails
  - API server should have a NoSQL DB for persistance
  - API server and its DB will be deployed as docker containers
* Plans for next week:
  - Anoop to get back on how to map user credentials and hypledger certificates
  - Start the study/implementation of API server

21.06.2020
* Very very productive week
* demoed:
  - pdc upvote/update
* Plans for next week: 
  - Anoop will get back on timer
  - separate upvote and downvote
  - user's unique key for pdc
  - start thinking about client implementation

14.06.2020
* Project plan submitted - 11.06.2020
* Not much time, still finished: #4
* Private Data Collection (PDC):
  ** challenge with sdk
* Plans for next week: 
 - sort: fabric node sdk with private date collections
 - work on #5, #6, #7
 - Anoop will check: (a) Pull request (b) Get a hold about creating a poll in fabric
 
07.06.2020
* Iterative is okay
* Project plan 
* HLF2.0
* Read the docs fabric/fabric-ca
* Start with MVP 0.1 == 0.0.1 version in github
