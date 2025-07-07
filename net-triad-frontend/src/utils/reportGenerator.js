import { fullQuestionnaireData } from '@/api/mockData'

const categoryKeyMap = {
  ws: 'Website Strength',
  dn: 'Devices & Network',
  cd: 'Compliance Documentation', // Note: This has the typo as requested for the demonstration
  cs: 'Cyber Security Implementations',
}

const categoryNameToKeyMap = Object.fromEntries(
  Object.entries(categoryKeyMap).map(([key, name]) => [name, key]),
)

const questionsByShortKeyMap = fullQuestionnaireData.reduce((acc, q) => {
  const shortKey = categoryNameToKeyMap[q.category]
  if (shortKey) {
    if (!acc[shortKey]) acc[shortKey] = []
    acc[shortKey].push(q)
  }
  return acc
}, {})

export function generateMockReport(targetScores) {
  const allRecommendations = []
  const finalScores = {}

  for (const shortKey in questionsByShortKeyMap) {
    const targetScore = targetScores[shortKey]
    const categoryQuestions = questionsByShortKeyMap[shortKey] || []
    const questionCount = categoryQuestions.length
    if (questionCount === 0) {
      // finalScores[shortKey] = targetScore
      finalScores[shortKey] = 0 // No questions means no score
      continue
    }

    const maxCategoryScore = 100
    // let scoreDeficit = maxCategoryScore - targetScore
    const scoreDeficit = maxCategoryScore - targetScore
    let currentCategoryScore = 0
    const answersForCategory = {}

    // Calculate how many questions need to be sub-optimal to meet the target score
    const maxPointsPerQuestion = 100 / questionCount
    // Smallest possible point loss is by choosing score +1 instead of +2
    const smallestPointLoss = ((2 - 1) / 4) * maxPointsPerQuestion
    let questionsToChange = 0
    if (smallestPointLoss > 0) {
      questionsToChange = Math.round(scoreDeficit / smallestPointLoss)
    }
    questionsToChange = Math.min(questionsToChange, questionCount)

    // Assign answers based on the calculation
    categoryQuestions.forEach((q, index) => {
      const optionsSorted = [...q.options].sort((a, b) => b.score - a.score)
      // Change the first 'questionsToChange' questions to be sub-optimal
      if (index < questionsToChange) {
        answersForCategory[q.id] = optionsSorted[1] || optionsSorted[0] // Second best option
      } else {
        answersForCategory[q.id] = optionsSorted[0] // Perfect option
      }
    })

    // Calculate final score and recommendations from the chosen answers
    categoryQuestions.forEach((q) => {
      const selectedOption = answersForCategory[q.id]
      const impactValue = selectedOption ? parseFloat(selectedOption.score) : NaN
      const maxPointsPerQuestion = 100 / questionCount
      if (!isNaN(impactValue)) {
        const normalizedImpact = (impactValue + 2) / 4
        const questionScore = normalizedImpact * maxPointsPerQuestion
        currentCategoryScore += questionScore
        if (impactValue < 2) {
          allRecommendations.push({
            text: selectedOption.recommendation,
            impactScore: Math.round(maxPointsPerQuestion - questionScore),
            category: q.category,
          })
        }
      }
    })
    finalScores[shortKey] = Math.round(currentCategoryScore)
  }

  // const overall = Math.round(Object.values(finalScores).reduce((a, b) => a + b, 0) / 4)
  const scoreValues = Object.values(finalScores)
  // const overall = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
  const overall =
    scoreValues.length > 0
      ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
      : 0
  const fullRecommendations = allRecommendations.sort((a, b) => b.impactScore - a.impactScore)

  return {
    ws: finalScores.ws || 0,
    dn: finalScores.dn || 0,
    cd: finalScores.cd || 0,
    cs: finalScores.cs || 0,
    overall,
    recommendations: fullRecommendations,
  }
}
