param(
  [string]$ModelsPath = "X:\Ollama",
  [string]$Model = "codellama:latest"
)

$ollamaCommand = Get-Command ollama -ErrorAction Stop

if (-not (Test-Path -LiteralPath $ModelsPath)) {
  Write-Error "Ollama models path '$ModelsPath' was not found."
  exit 1
}

$env:OLLAMA_MODELS = $ModelsPath

Write-Host "Using OLLAMA_MODELS=$env:OLLAMA_MODELS"
Write-Host "Starting Ollama for model $Model"
Write-Host "Use 'ollama list' in another shell to confirm the model is visible."

& $ollamaCommand.Source serve
