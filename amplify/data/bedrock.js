export function request(ctx) {
  const { ingredients = [] } = ctx.args;
  const prompt =
    `Suggest a simple recipe using these ingredients: ${ingredients.join(", ")}.`;

  return {
    resourcePath: "/model/amazon.nova-micro-v1:0/invoke",
    method: "POST",
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        schemaVersion: "messages-v1",
        messages: [
          {
            role: "user",
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 1000,
          temperature: 0.7,
        },
      }),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    return { error: ctx.error.message };
  }

  if (ctx.result.statusCode !== 200) {
    return { error: ctx.result.body };
  }

  const parsedBody = JSON.parse(ctx.result.body);

  return {
    body: parsedBody.output.message.content[0].text,
  };
}