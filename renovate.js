module.exports = {
  // set up registry rules to redirect all external dependencies to the internal
  // Artifactory proxy (or mirror)
  extends: [
    "config:base",
    ":separatePatchReleases"
  ],
  $schema: "https://docs.renovatebot.com/renovate-schema.json",
  autodiscover: true,
  username: "oss-renovate[bot]",
  gitAuthor: "oss-renovate[bot] <16560+oss-renovate[bot]@users.noreply.git.dhl.com>",
  packageRules: [
    {
      "matchManagers": [
        "helmv3"
      ],
      "additionalBranchPrefix": "{{{ replace '^clusters/([a-zA-Z0-9_-]*)/.*$' '$1/' packageFileDir }}}",
      "addLabels": [
        "helm",
        "env/{{{ replace '^clusters/([a-zA-Z0-9_-]*)/.*$' '$1' packageFileDir }}}",
        "dep/{{{ depName }}}"
      ],
      "commitMessageSuffix": "in {{{ replace '^clusters/([a-zA-Z0-9_-]*)/.*$' '$1' packageFileDir }}}",
      "rangeStrategy": "bump",
      "pruneStaleBranches": false
    },
    {
      // redirect all docker registries to the global Artifactory Docker registry
      matchDatasources: ["docker"],
      registryUrls: ["https://docker.artifactory.dhl.com"],
    }
  ],
  "postUpdateOptions": [
    "helmUpdateSubChartArchives"
  ],
  major: {
    "addLabels": [
      "size/major"
    ]
  },
  minor: {
    "addLabels": [
      "size/minor"
    ]
  },
  patch: {
    "addLabels": [
      "size/patch"
    ]
  },
  // set up host rules to authenticate with the Artifactory proxy (or mirror)
  hostRules: [
    {
      // set a shorter timeout for all requests, as the default is 60s and we
      // don't want to wait that long if renovate tries to call out to a host it
      // can't reach (e.g. anything on the internet not whitelisted in the
      // firewall or proxy)
      timeout: 15000,
    },
    {
      // set up authentication for the Artifactory repositories; if the
      // protocol is not specified, it will use credentials for all subdomains
      // instead of just the exact host name, cf.
      // https://docs.renovatebot.com/configuration-options/#matchhost
      matchHost: "artifactory.dhl.com",
      username: process.env.SECRET_ARTIFACTORY_USERNAME,
      password: process.env.SECRET_ARTIFACTORY_PASSWORD,
    }
  ],
};
