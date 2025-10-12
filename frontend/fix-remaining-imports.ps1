# Script para corrigir imports restantes
Write-Host "Corrigindo imports restantes..."

$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts", "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Corrige mais imports específicos
    $content = $content -replace "import App from '';", "import App from './App';"
    $content = $content -replace "import ReservaService from '';", "import ReservaService from '../services/reservaService';"
    $content = $content -replace "import \{ ProdutoService \} from '';", "import { ProdutoService } from '../services/produtoService';"
    $content = $content -replace "import \{ jwtFetch \} from '';", "import { jwtFetch } from '../services/jwtFetch';"
    $content = $content -replace "import type \{ TableColumn \} from '';", "import type { TableColumn } from '../components/ui/Table';"
    $content = $content -replace "import \{ useProdutos, useSoftDeleteProduto \} from '';", "import { useProdutos, useSoftDeleteProduto } from '../hooks/useProdutos';"
    $content = $content -replace "import ProductForm from '';", "import ProductForm from '../components/ProductForm';"
    $content = $content -replace "import \{ formatCurrency \} from '';", "import { formatCurrency } from '../utils/formatters';"
    $content = $content -replace "import \{ OrcamentoService \} from '';", "import { OrcamentoService } from '../services/orcamentoService';"
    $content = $content -replace "import ReservaForm from '';", "import ReservaForm from '../components/ReservaForm';"
    $content = $content -replace "import \{ useLocais, useRemoverLocal \} from '';", "import { useLocais, useRemoverLocal } from '../hooks/useLocais';"
    $content = $content -replace "import LocalForm from '';", "import LocalForm from '../components/LocalForm';"
    $content = $content -replace "import MovimentoService from '';", "import MovimentoService from '../services/movimentoService';"
    $content = $content -replace "import LocalService from '';", "import LocalService from '../services/localService';"
    $content = $content -replace "import DashboardService from '';", "import DashboardService from '../services/dashboardService';"
    $content = $content -replace "import DashboardCard from '';", "import DashboardCard from '../components/DashboardCard';"
    
    # Salva apenas se houve mudanças
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Corrigido: $($file.Name)"
    }
}

Write-Host "Correção de imports restantes concluída!"