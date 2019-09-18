const DiscoveryV1 = require("ibm-watson/discovery/v1");

async function queryDiscovery(
  environmentId,
  collectionId,
  discoveryUsername,
  discoveryPassword,
  query,
  url
) {
  // Function to query Discovery
  try {
    const discovery = new DiscoveryV1({
      version: "2019-02-01",
      username: discoveryUsername,
      password: discoveryPassword,
      url: url
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
      input,
      url
    } = params;

    try {
      const queryString = `enriched_description.keywords.text: ${input}`;

      const queryResult = await queryDiscovery(
        environmentId,
        collectionId,
        discoveryUsername,
        discoveryPassword,
        queryString,
        url
      );

      const courses = [];

      if (!queryResult.results) {
        return queryResult;
      }

      queryResult.results.forEach(result => {
        if (courses.length <= 3) {
          const course = {
            name: result.name,
            link: `https://www.coursera.org/learn/${result.slug}`,
            description: result.description.split(".")[0]
          };
          courses.push(course);
        }
      });

      if (courses.length === 0) {
        return { err: "No courses are found" };
      }

      return { courses };
    } catch (err) {
      return { err: err.message };
    }
  }
};

module.exports = CourseAdvisor;
