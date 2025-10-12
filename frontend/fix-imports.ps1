# Script para corrigir todas as importações removendo extensões .ts e .tsx
Write-Host "Iniciando correção de imports..."

# Busca todos os arquivos .ts e .tsx no diretório src
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

$totalFiles = $files.Count
$processedFiles = 0

foreach ($file in $files) {
    $processedFiles++
    Write-Progress -Activity "Corrigindo imports" -Status "Processando $($file.Name)" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove extensões .tsx de imports
    $content = $content -replace "from\s+['""]([^'""]+)\.tsx['""]", "from '$1'"
    
    # Remove extensões .ts de imports
    $content = $content -replace "from\s+['""]([^'""]+)\.ts['""]", "from '$1'"
    
    # Remove extensões .tsx de imports dinâmicos
    $content = $content -replace "import\s*\(\s*['""]([^'""]+)\.tsx['""]", "import('$1'"
    
    # Remove extensões .ts de imports dinâmicos
    $content = $content -replace "import\s*\(\s*['""]([^'""]+)\.ts['""]", "import('$1'"
    
    # Salva apenas se houve mudanças
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corrigido: $($file.Name)"
    }
}

Write-Host ""
Write-Host "Correção concluída! $processedFiles arquivos processados."