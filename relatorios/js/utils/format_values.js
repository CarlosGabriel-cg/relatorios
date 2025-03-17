export function formatCurrency(value) {
    let passaString = String(value);    

    if (passaString.includes('D')) {        
        passaString = passaString.replace('D', '').replace(/\./g, '').replace(',', '.');
    } else {        
        passaString = passaString.replace(',', '.');
    }

    const valorFormatado = parseFloat(passaString);
    if (isNaN(valorFormatado)) {
        return '';
    }


    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valorFormatado);
}
