'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Trophy, RefreshCw } from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface QCMProps {
  documentTitle: string
  questions: Question[]
}

export function QCM({ documentTitle, questions }: QCMProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1))
  const [isCompleted, setIsCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const answeredQuestions = selectedAnswers.filter(answer => answer !== -1).length

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleCompleteQuiz = () => {
    setIsCompleted(true)
    setShowResults(true)
  }

  const handleRestartQuiz = () => {
    setSelectedAnswers(new Array(questions.length).fill(-1))
    setCurrentQuestionIndex(0)
    setIsCompleted(false)
    setShowResults(false)
  }

  const calculateScore = () => {
    let correct = 0
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++
      }
    })
    return { correct, total: totalQuestions, percentage: Math.round((correct / totalQuestions) * 100) }
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 80) return "Excellent ! Vous maîtrisez bien ce sujet."
    if (percentage >= 60) return "Bien ! Vous avez une bonne compréhension."
    if (percentage >= 40) return "Pas mal ! Quelques révisions seraient utiles."
    return "Continuez à étudier, vous y arriverez !"
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  if (showResults) {
    const score = calculateScore()
    
    return (
      <Card className="w-full">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Résultats du QCM
          </CardTitle>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Trophy className={`w-6 h-6 ${getScoreColor(score.percentage)}`} />
            <span className={`text-2xl font-bold ${getScoreColor(score.percentage)}`}>
              {score.correct}/{score.total}
            </span>
          </div>
          <p className={`text-lg font-medium ${getScoreColor(score.percentage)}`}>
            {score.percentage}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {getScoreMessage(score.percentage)}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Résumé des réponses */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Vos réponses :</h4>
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index]
              const isCorrect = userAnswer === question.correctAnswer
              
              return (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        Question {index + 1} : {question.question}
                      </p>
                      
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              optionIndex === question.correctAnswer 
                                ? 'border-green-600 bg-green-100' 
                                : optionIndex === userAnswer && !isCorrect
                                ? 'border-red-600 bg-red-100'
                                : 'border-gray-300'
                            }`}>
                              {optionIndex === question.correctAnswer && (
                                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              )}
                              {optionIndex === userAnswer && !isCorrect && (
                                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                              )}
                            </div>
                            <span className={`text-sm ${
                              optionIndex === question.correctAnswer 
                                ? 'text-green-700 font-medium' 
                                : optionIndex === userAnswer && !isCorrect
                                ? 'text-red-700 font-medium'
                                : 'text-gray-600'
                            }`}>
                              {option}
                            </span>
                            {optionIndex === question.correctAnswer && (
                              <span className="text-xs text-green-600 font-medium">✓ Bonne réponse</span>
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <span className="text-xs text-red-600 font-medium">✗ Votre réponse</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                          <p className="text-xs text-blue-800">
                            <strong>Explication :</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleRestartQuiz}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recommencer le QCM</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          QCM : {documentTitle}
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} sur {totalQuestions}</span>
          <span>{answeredQuestions}/{totalQuestions} répondues</span>
        </div>
        
        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question actuelle */}
        <div>
          <h3 className="text-base font-medium text-gray-800 mb-4">
            {currentQuestion.question}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestionIndex] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestionIndex] === index && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4"
          >
            Précédent
          </Button>
          
          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleCompleteQuiz}
              disabled={answeredQuestions < totalQuestions}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              Terminer le QCM
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === -1}
              className="px-4"
            >
              Suivant
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}








