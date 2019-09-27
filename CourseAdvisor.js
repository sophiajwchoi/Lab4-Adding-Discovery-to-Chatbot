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
    throw new Error(err.message);
  }
}

async function recommendCourse(queryResult) {
  try {
    const courses = [];

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
      throw new Error("No courses are found");
    }

    return { courses };
  } catch (err) {
    throw new Error(err.message);
  }
}

async function answerFaq(queryResult) {
  try {
    textContent = queryResult.results[0].text;
    splitTextContent = textContent.split("\n\n");

    if (splitTextContent.length >= 9) {
      return {
        res: splitTextContent[6] + splitTextContent[7] + splitTextContent[8]
      };
    }
    throw new Error(
      "Sorry, we are unable to find the answer from Help Centre."
    );
  } catch (err) {
    throw new Error(err.message);
  }
}

const CourseraAdvisor = {
  async connectDiscovery(params) {
    const {
      discoveryUsername,
      discoveryPassword,
      environmentId,
      collectionId,
      input,
      intent,
      url
    } = params;

    try {
      let enrichedField;
      if (intent === "course_recommendation") {
        enrichedField = "description";
      } else if (intent === "faq") {
        enrichedField = "text";
      } else {
        throw new Error(`Intent: ${intent} cannot be recognized`);
      }

      const queryString = `enriched_${enrichedField}.keywords.text: ${input}`;

      const queryResult = await queryDiscovery(
        environmentId,
        collectionId,
        discoveryUsername,
        discoveryPassword,
        queryString,
        url
      );

      if (!queryResult) {
        return "No query result found";
      } else if (!queryResult.results) {
        return queryResult;
      }

      let res;
      if (intent === "course_recommendation") {
        res = await recommendCourse(queryResult);
      } else {
        res = await answerFaq(queryResult);
      }

      return res;
    } catch (err) {
      return { err: err.message };
    }
  }
};

module.exports = CourseraAdvisor;
