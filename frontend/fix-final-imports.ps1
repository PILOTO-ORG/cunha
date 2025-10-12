# Script final para corrigir todos os imports restantes
Write-Host "Aplicando correção final de imports..."

$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Corrige os últimos imports específicos
    $content = $content -replace "import ClienteService from '';", "import ClienteService from '../services/clienteService';"
    $content = $content -replace "import QuickAction from '';", "import QuickAction from '../components/QuickAction';"
    $content = $content -replace "import \{ useClientes, useRemoverCliente, useSoftDeleteCliente, useAtualizarCliente \} from '';", "import { useClientes, useRemoverCliente, useSoftDeleteCliente, useAtualizarCliente } from '../hooks/useClientes';"
    $content = $content -replace "import ClientForm from '';", "import ClientForm from '../components/ClientForm';"
    $content = $content -replace "import \{ Cliente \} from '';", "import { Cliente } from '../types/api';"
    $content = $content -replace "import \{ formatPhoneNumber, formatCPF, formatCNPJ \} from '';", "import { formatPhoneNumber, formatCPF, formatCNPJ } from '../utils/formatters';"
    $content = $content -replace "import Textarea from '';", "import Textarea from './ui/Textarea';"
    $content = $content -replace "import \{ useCriarProduto, useAtualizarProduto \} from '';", "import { useCriarProduto, useAtualizarProduto } from '../hooks/useProdutos';"
    $content = $content -replace "import \{ useCriarLocal, useAtualizarLocal \} from '';", "import { useCriarLocal, useAtualizarLocal } from '../hooks/useLocais';"
    $content = $content -replace "import Select from '';", "import Select from './ui/Select';"
    $content = $content -replace "import type \{ Option \} from '';", "import type { Option } from '../types/select';"
    $content = $content -replace "import \{ useCriarCliente, useAtualizarCliente \} from '';", "import { useCriarCliente, useAtualizarCliente } from '../hooks/useClientes';"
    $content = $content -replace "import \{ Cliente, AtualizarClienteRequest, CriarClienteRequest \} from '';", "import { Cliente, AtualizarClienteRequest, CriarClienteRequest } from '../types/api';"
    
    # Salva apenas se houve mudanças
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corrigido: $($file.Name)"
    }
}

Write-Host "Correção final concluída!"