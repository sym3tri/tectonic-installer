const log = require('../utils/log');
const wizard = require('../utils/wizard');
const tfvarsUtil = require('../utils/terraformTfvars');

// Test input .progress file
const input = tfvarsUtil.loadJson('aws-custom-vpc.progress').clusterConfig;

const testPage = (page, nextInitiallyDisabled) => wizard.testPage(page, 'aws', input, nextInitiallyDisabled);

const REQUIRED_ENV_VARS = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'TF_VAR_tectonic_license_path', 'TF_VAR_tectonic_pull_secret_path'];

module.exports = {
  before (client) {
    const missing = REQUIRED_ENV_VARS.filter(ev => !process.env[ev]);
    if (missing.length) {
      console.error(`Missing environment variables: ${missing.join(', ')}.\n`);
      process.exit(1);
    }
    client.url(client.launch_url);
  },

  after (client) {
    client.getLog('browser', log.logger);
    client.end();
  },

  'AWS: Platform': client => {
    const platformPage = client.page.platformPage();
    platformPage.test('@awsGUI');
    platformPage.expect.element(wizard.nextStep).to.have.attribute('class').which.not.contains('disabled');
    platformPage.click(wizard.nextStep);
  },

  'AWS: AWS Credentials': ({page}) => testPage(page.awsCredentialsPage()),
  'AWS: Cluster Info': ({page}) => testPage(page.clusterInfoPage()),
  'AWS: Certificate Authority': ({page}) => testPage(page.certificateAuthorityPage(), false),
  'AWS: SSH Key': ({page}) => testPage(page.keysPage()),
  'AWS: Define Nodes': ({page}) => testPage(page.nodesPage(), false),
  'AWS: Networking': ({page}) => testPage(page.networkingPage()),
  'AWS: Console Login': ({page}) => testPage(page.consoleLoginPage()),

  'AWS: Manual Boot': client => tfvarsUtil.testManualBoot(client, 'aws.tfvars'),
};
