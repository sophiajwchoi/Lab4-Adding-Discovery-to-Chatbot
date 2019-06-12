const DiscoveryV1 = require("ibm-watson/discovery/v1");

async function queryDiscovery(
  environmentId,
  collectionId,
  discoveryUsername,
  discoveryPassword,
  query
) {
  // Function to query Discovery
  try {
    const discovery = new DiscoveryV1({
      version: "2019-02-01",
      username: discoveryUsername,
      password: discoveryPassword
    });

    const queryResult = await discovery.query({
      environment_id: environmentId,
      collection_id: collectionId,
      query: query
    });

    return queryResult;
  } catch (err) {
    return { err: err.message };
  }
}

const CourseAdvisor = {
  async connectDiscovery(params) {
    const {
      discoveryUsername,
      discoveryPassword,
      environmentId,
      collectionId,
      input
    } = params;

    try {
      const queryString = `enriched_description.keywords.text: ${input}`;

      const queryResult = await queryDiscovery(
        environmentId,
        collectionId,
        discoveryUsername,
        discoveryPassword,
        queryString
      );

      return {
        courseName: queryResult.results[0].name,
        courseLink: `https://www.coursera.org/learn/${
          queryResult.results[0].slug
        }`,
        courseDescription: queryResult.results[0].description
      };
    } catch (err) {
      return { err: err.message };
    }
  }
};

module.exports = CourseAdvisor;
