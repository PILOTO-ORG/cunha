# Script para corrigir imports quebrados
Write-Host "Corrigindo imports quebrados..."

# Busca todos os arquivos .ts e .tsx no diretório src
$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Corrige imports específicos que ficaram vazios
    $content = $content -replace "import apiRequest from '';", "import apiRequest from '../services/apiClient';"
    $content = $content -replace "import \{ apiClient \} from '';", "import { apiClient } from './apiClient';"
    $content = $content -replace "import AIAssistant from '';", "import AIAssistant from '../components/AIAssistant';"
    $content = $content -replace "import Table from '';", "import Table from '../components/ui/Table';"
    $content = $content -replace "import Button from '';", "import Button from '../components/ui/Button';"
    $content = $content -replace "import Modal from '';", "import Modal from '../components/ui/Modal';"
    $content = $content -replace "import LoadingSpinner from '';", "import LoadingSpinner from '../components/ui/LoadingSpinner';"
    $content = $content -replace "import Input from '';", "import Input from '../components/ui/Input';"
    $content = $content -replace "import \{ useReservas, useRemoverReserva \} from '';", "import { useReservas, useRemoverReserva } from '../hooks/useReservas';"
    $content = $content -replace "import \{ useClientes \} from '';", "import { useClientes } from '../hooks/useClientes';"
    $content = $content -replace "import \{ useProdutos \} from '';", "import { useProdutos } from '../hooks/useProdutos';"
    $content = $content -replace "import \{ useConverterOrcamento \} from '';", "import { useConverterOrcamento } from '../hooks/useOrcamentos';"
    $content = $content -replace "import OrcamentoForm from '';", "import OrcamentoForm from '../components/OrcamentoForm';"
    $content = $content -replace "import \{ useLocais \} from '';", "import { useLocais } from '../hooks/useLocais';"
    $content = $content -replace "import \{ formatDate, formatDateTime, formatCurrency \} from '';", "import { formatDate, formatDateTime, formatCurrency } from '../utils/formatters';"
    
    # Salva apenas se houve mudanças
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corrigido: $($file.Name)"
    }
}

Write-Host "Correção de imports quebrados concluída!"