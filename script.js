document.addEventListener("DOMContentLoaded", () => {
  console.log("QG Imperial — Sistema Operacional Ativo.");

  // 1. SISTEMA DE NOTIFICAÇÕES TÁTICAS (TOAST)
  function showTacticalAlert(title, message, type = 'info') {
    const container = document.getElementById("tactical-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const borderColor = type === 'error' ? 'border-[#8b0000]' : 'border-[#c5a059]';
    const textColor = type === 'error' ? 'text-[#f26d6d]' : 'text-[#f5e6c8]';

    toast.className = `pointer-events-auto bg-[#141c14] border ${borderColor} rounded-2xl p-4 shadow-2xl max-w-sm w-full transform translate-y-4 opacity-0 transition-all duration-300 flex flex-col gap-1.5`;
    toast.innerHTML = `
      <div class="flex items-center justify-between">
        <h4 class="font-cinzel font-bold ${textColor} text-xs flex items-center gap-2">
          <span>⚔️</span> <span>${title}</span>
        </h4>
        <button class="toast-close text-[#8a9a8a] hover:text-white text-sm font-bold leading-none cursor-pointer">✕</button>
      </div>
      <p class="text-[11px] text-[#d1d5db] font-sans leading-relaxed">${message}</p>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
      toast.classList.add("translate-y-0", "opacity-100");
    }, 10);

    const removeToast = () => {
      toast.classList.remove("translate-y-0", "opacity-100");
      toast.classList.add("translate-y-4", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    };

    const closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) closeBtn.addEventListener("click", removeToast);
    setTimeout(removeToast, 4000);
  }

  showTacticalAlert("SISTEMA ONLINE", "Dashboard tático principal carregado com sucesso.");

  // 2. CONTROLE DOS PAINÉIS EXTRAS (MODAIS DA BARRA LATERAL)
  const sidebarButtons = document.querySelectorAll(".sidebar-action");
  const extraModals = document.querySelectorAll(".extra-modal");
  const closeModalBtns = document.querySelectorAll(".close-modal-btn");

  sidebarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const modalId = btn.getAttribute("data-modal");
      if (modalId === "hq") {
        showTacticalAlert("QUARTEL GENERAL", "Você já está visualizando o painel principal do QG.");
        return;
      }

      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.remove("hidden");
      }
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".extra-modal");
      if (modal) modal.classList.add("hidden");
    });
  });

  extraModals.forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    });
  });

  // 3. LOGICA DO COFRE COM HIERARQUIA DE PASTAS E SUBPASTAS
  const vaultForm = document.getElementById("vault-form");
  const vaultAuthModal = document.getElementById("modal-vault-auth");
  const vaultPanel = document.getElementById("modal-vault-panel");
  const closeVaultPanelBtn = document.getElementById("close-vault-panel");
  const vaultFileInput = document.getElementById("vault-file-input");
  const vaultFolderInput = document.getElementById("vault-folder-input");
  const vaultBackBtn = document.getElementById("vault-back-btn");
  const vaultPathDisplay = document.getElementById("vault-path-display");
  const vaultCreateFolderBtn = document.getElementById("vault-create-folder-btn");

  const SENHA_SECRETA = "501013";
  let currentVaultPath = "";

  let vaultItems = JSON.parse(localStorage.getItem('berun_vault_items')) || [
    {
      type: "file",
      name: "Codigos_De_Acesso_Reno.txt",
      path: "",
      date: "Atualizado hoje • Nível Absoluto",
      content: "SETOR-95: DIRETRIZES DE EMERGÊNCIA\n- Manter obediência cega aos regulamentos.\n- Uso do Orbe Tipo-95 autorizado apenas sob jurisdição do Alto Comando."
    },
    {
      type: "folder",
      name: "Frente_Oriental",
      path: ""
    }
  ];

  function renderVaultItems() {
    const listContainer = document.getElementById('vault-file-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (vaultPathDisplay) {
      vaultPathDisplay.textContent = currentVaultPath === "" ? "/ (Raiz)" : `/ ${currentVaultPath}`;
    }
    if (vaultBackBtn) {
      if (currentVaultPath === "") {
        vaultBackBtn.classList.add("hidden");
      } else {
        vaultBackBtn.classList.remove("hidden");
      }
    }

    const currentItems = vaultItems.filter(item => item.path === currentVaultPath);

    if (currentItems.length === 0) {
      listContainer.innerHTML = `<p class="text-xs text-center text-[#8a9a8a] py-6">Este diretório está vazio.</p>`;
      return;
    }

    const folders = currentItems.filter(i => i.type === 'folder');
    const files = currentItems.filter(i => i.type === 'file');

    folders.forEach((folder) => {
      const globalIndex = vaultItems.indexOf(folder);
      const item = document.createElement('div');
      item.className = 'p-3 bg-[#18221a] rounded-2xl border border-[#2e3f30] flex items-center justify-between hover:border-[#c5a059]/60 transition cursor-pointer group';
      item.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden flex-1">
          <span class="text-xl">📁</span>
          <div class="truncate flex-1">
            <h4 class="text-xs font-bold text-[#f5e6c8] group-hover:text-[#c5a059] transition truncate">${folder.name}/</h4>
            <p class="text-[10px] text-[#8a9a8a]">Diretório</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" class="bg-[#233023] hover:bg-[#2d3e2d] text-[#c5a059] border border-[#c5a059]/40 text-xs px-3 py-1.5 rounded-xl transition cursor-pointer">Abrir</button>
          <button type="button" onclick="event.stopPropagation(); deleteVaultItem(${globalIndex})" class="bg-[#8b0000]/20 hover:bg-[#8b0000] text-[#f26d6d] hover:text-white border border-[#8b0000]/40 text-xs px-2.5 py-1.5 rounded-xl transition cursor-pointer" title="Excluir Pasta">✕</button>
        </div>
      `;
      item.querySelector('.flex-1').addEventListener('click', () => openVaultFolder(folder.name));
      item.querySelector('button:not([title])').addEventListener('click', () => openVaultFolder(folder.name));
      listContainer.appendChild(item);
    });

    files.forEach((file) => {
      const globalIndex = vaultItems.indexOf(file);
      const icon = file.name.endsWith('.txt') ? '📄' : file.name.endsWith('.xlsx') || file.name.endsWith('.csv') ? '📊' : '📎';

      const item = document.createElement('div');
      item.className = 'p-3 bg-[#18221a] rounded-2xl border border-[#2e3f30] flex items-center justify-between hover:border-[#c5a059]/40 transition';
      item.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden flex-1">
          <span class="text-xl">${icon}</span>
          <div class="truncate">
            <h4 class="text-xs font-bold text-[#f5e6c8] truncate">${file.name}</h4>
            <p class="text-[10px] text-[#8a9a8a]">${file.date || 'Arquivo importado'}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="downloadVaultFile(${globalIndex})" class="bg-[#233023] hover:bg-[#2d3e2d] text-[#c5a059] border border-[#c5a059]/40 text-xs px-3 py-1.5 rounded-xl transition cursor-pointer">Baixar</button>
          <button onclick="deleteVaultItem(${globalIndex})" class="bg-[#8b0000]/20 hover:bg-[#8b0000] text-[#f26d6d] hover:text-white border border-[#8b0000]/40 text-xs px-2.5 py-1.5 rounded-xl transition cursor-pointer" title="Excluir">✕</button>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  window.openVaultFolder = function(folderName) {
    currentVaultPath += folderName + "/";
    renderVaultItems();
  };

  if (vaultBackBtn) {
    vaultBackBtn.addEventListener("click", () => {
      if (currentVaultPath === "") return;
      const segments = currentVaultPath.split("/").filter(Boolean);
      segments.pop();
      currentVaultPath = segments.length > 0 ? segments.join("/") + "/" : "";
      renderVaultItems();
    });
  }

  if (vaultCreateFolderBtn) {
    vaultCreateFolderBtn.addEventListener("click", () => {
      const folderName = prompt("Digite o nome/codinome da nova pasta:");
      if (!folderName || !folderName.trim()) return;

      const cleanName = folderName.trim().replace(/\//g, "");
      const exists = vaultItems.some(i => i.path === currentVaultPath && i.name === cleanName && i.type === 'folder');
      
      if (exists) {
        showTacticalAlert("ERRO", "Já existe uma pasta com este nome neste diretório.", "error");
        return;
      }

      vaultItems.push({
        type: "folder",
        name: cleanName,
        path: currentVaultPath
      });

      localStorage.setItem('berun_vault_items', JSON.stringify(vaultItems));
      renderVaultItems();
      showTacticalAlert("PASTA CRIADA", `Diretório '${cleanName}' estabelecido com sucesso.`);
    });
  }

  window.downloadVaultFile = function(index) {
    const file = vaultItems[index];
    showTacticalAlert("DESCARREGANDO", `Baixando arquivo: ${file.name}`);

    const content = file.content || "Conteúdo confidencial do Império de Berun.";
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  window.deleteVaultItem = function(index) {
    const item = vaultItems[index];

    if (item.type === 'folder') {
      const targetFolderPath = item.path + item.name + "/";
      vaultItems = vaultItems.filter(i => !(i.path.startsWith(targetFolderPath) || (i === item)));
    } else {
      vaultItems.splice(index, 1);
    }

    localStorage.setItem('berun_vault_items', JSON.stringify(vaultItems));
    renderVaultItems();
    showTacticalAlert("REGISTRO REMOVIDO", `Item '${item.name}' removido do cofre.`, 'error');
  };

  // Upload de arquivos soltos
  if (vaultFileInput) {
    vaultFileInput.addEventListener("change", (e) => {
      const uploadedFiles = e.target.files;
      if (!uploadedFiles.length) return;

      Array.from(uploadedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
          const newEntry = {
            type: "file",
            name: file.name,
            path: currentVaultPath,
            date: "Adicionado agora • Confidencial",
            content: event.target.result
          };

          const existingIndex = vaultItems.findIndex(i => i.type === 'file' && i.path === currentVaultPath && i.name === file.name);
          if (existingIndex !== -1) {
            vaultItems[existingIndex] = newEntry;
          } else {
            vaultItems.push(newEntry);
          }

          localStorage.setItem('berun_vault_items', JSON.stringify(vaultItems));
          renderVaultItems();
          showTacticalAlert("ARQUIVO INTEGRADO", `Arquivo '${file.name}' adicionado com sucesso!`);
        };

        reader.readAsText(file);
      });

      vaultFileInput.value = '';
    });
  }

  // Upload de pastas e subpastas completas
  if (vaultFolderInput) {
    vaultFolderInput.addEventListener("change", (e) => {
      const uploadedFiles = e.target.files;
      if (!uploadedFiles.length) return;

      Array.from(uploadedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
          let targetPath = currentVaultPath;
          let fileName = file.name;

          if (file.webkitRelativePath) {
            const parts = file.webkitRelativePath.split('/');
            fileName = parts.pop(); 
            const folderParts = parts; 
            
            let accumulatedPath = currentVaultPath;
            folderParts.forEach(folderName => {
              const folderExists = vaultItems.some(i => i.path === accumulatedPath && i.name === folderName && i.type === 'folder');
              if (!folderExists) {
                vaultItems.push({
                  type: "folder",
                  name: folderName,
                  path: accumulatedPath
                });
              }
              accumulatedPath += folderName + "/";
            });
            targetPath = accumulatedPath;
          }

          const newEntry = {
            type: "file",
            name: fileName,
            path: targetPath,
            date: "Importado via Pasta • Confidencial",
            content: event.target.result
          };

          const existingIndex = vaultItems.findIndex(i => i.type === 'file' && i.path === targetPath && i.name === fileName);
          if (existingIndex !== -1) {
            vaultItems[existingIndex] = newEntry;
          } else {
            vaultItems.push(newEntry);
          }

          localStorage.setItem('berun_vault_items', JSON.stringify(vaultItems));
          renderVaultItems();
        };

        reader.readAsText(file);
      });

      vaultFolderInput.value = '';
      showTacticalAlert("PASTA IMPORTADA", "Estrutura de pastas e arquivos sincronizada com sucesso!");
    });
  }

  if (vaultForm) {
    vaultForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputPass = document.getElementById("vault-password").value;

      if (inputPass === SENHA_SECRETA) {
        if (vaultAuthModal) vaultAuthModal.classList.add("hidden");
        document.getElementById("vault-password").value = "";
        if (vaultPanel) vaultPanel.classList.remove("hidden");
        currentVaultPath = ""; 
        renderVaultItems();
        showTacticalAlert("ACESSO CONCEDIDO", "Cofre descriptografado com sucesso. Arquivos disponíveis.");
      } else {
        if (vaultAuthModal) vaultAuthModal.classList.add("hidden");
        document.getElementById("vault-password").value = "";
        showTacticalAlert("ACESSO NEGADO", "Senha incorreta! Painel bloqueado por segurança.", 'error');
      }
    });
  }

  if (closeVaultPanelBtn) {
    closeVaultPanelBtn.addEventListener("click", () => {
      if (vaultPanel) vaultPanel.classList.add("hidden");
    });
  }

  if (vaultPanel) {
    vaultPanel.addEventListener("click", (e) => {
      if (e.target === vaultPanel) {
        vaultPanel.classList.add("hidden");
      }
    });
  }

  // 4. ALTERNADOR DE MODOS TÁTICOS
  const modeBtn = document.getElementById("mode-toggle");
  const statusIndicator = document.getElementById("status-indicator");
  
  const modes = [
    { name: "Padrão HQ", class: "", indicator: "bg-[#8b0000]", msg: "Modo Padrão de Visibilidade Ativado." },
    { name: "Alerta Vermelho", class: "mode-red-alert", indicator: "bg-red-500", msg: "MODO DE COMBATE: Alerta Vermelho Ativado!" },
    { name: "Furtivo Stealth", class: "mode-stealth", indicator: "bg-emerald-500", msg: "Modo Furtivo Ativado. Assinatura reduzida." }
  ];

  let currentModeIndex = 0;

  if (modeBtn) {
    modeBtn.addEventListener("click", () => {
      if (modes[currentModeIndex].class) {
        document.body.classList.remove(modes[currentModeIndex].class);
      }

      currentModeIndex = (currentModeIndex + 1) % modes.length;
      const newMode = modes[currentModeIndex];

      if (newMode.class) {
        document.body.classList.add(newMode.class);
      }
      
      if (statusIndicator) {
        statusIndicator.className = `w-3 h-3 rounded-full inline-block animate-pulse ${newMode.indicator}`;
      }

      showTacticalAlert("CONFIGURAÇÃO DE SISTEMA", newMode.msg);
    });
  }

  // 5. BUSCA TÁTICA EM TEMPO REAL
  const searchInput = document.getElementById("tactical-search");
  const searchableCards = document.querySelectorAll(".searchable-card");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();

      searchableCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
          card.style.display = "";
          card.style.opacity = "1";
          card.style.borderColor = query !== "" ? "#c5a059" : "";
        } else {
          card.style.opacity = "0.2";
        }
      });
    });
  }

  // 6. DOWNLOAD DO DOSSIÊ (CV EM TXT)
  const downloadBtn = document.getElementById("download-cv");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const cvText = `====================================================================
         REPÚBLICA / IMPÉRIO DE BERUN — ESTADO-MAIOR GERAL
    DIRETORIA DE ENGENHARIA TÁTICA, DESENVOLVIMENTO E LOGÍSTICA
        DOSSIÊ DE REGISTRO DE OFICIAL — CLASSIFICAÇÃO: RESTRITO
====================================================================
IDENTIFICAÇÃO: Major Mota (Codinome: "Diabo do Reno / D'ARC")
POSTO / FUNÇÃO: Oficial de Engenharia de Sistemas & Arquitetura Front-End
ÍNDICE DE DESEMPENHO: 99.8% Uptime | Conformidade Operacional: 100%

--------------------------------------------------------------------
I. CREDENCIAIS E PATENTES TÉCNICO-MILITARES DO IMPÉRIO:
--------------------------------------------------------------------
- Permissão de Combate Estrutural (HTML5)
- Permissão de Estilização Avançada e Malhas Visuais (CSS3)
- Protocolo de Manuseio de Insanidade Dinâmica (JavaScript ES6+)
- Algoritmos de Lógica Automatizada de Alto Coeficiente (Python)
- Engenharia Mobile de Deslocamento Transversal (Flutter)

--------------------------------------------------------------------
II. ESPECIALIZAÇÕES DE CAMPO E INTENDÊNCIA DO ESTADO-MAIOR:
--------------------------------------------------------------------
- Serviço de Evacuação e Resgate: Socorrista de Campanha (Bombeiro Aprendiz)
- Comando de Logística de Suprimentos Operacionais do Estado-Maior
- Arquitetura de Simulações de Teatros de Guerra: Engenheiro de Simuladores Bélicos & Criação de Jogos

--------------------------------------------------------------------
III. TEATROS DE OPERAÇÕES ATIVOS (CAMPANHAS DE SISTEMAS WEB):
--------------------------------------------------------------------
- APOCALYPSE UI: https://imota2.github.io/APOCALYPSE_UI/
- Seireitei: https://imota2.github.io/Seireitei/
- Darc System: https://imota2.github.io/darcsystem/

--------------------------------------------------------------------
IV. DIRETRIZ DE TRANSMISSÃO E COMUNICAÇÃO:
--------------------------------------------------------------------
Qualquer ordem de serviço, diretriz tática ou requisição de código deve 
ser encaminhada estritamente através do painel central HQ do Império.
A desobediência aos prazos ou ineficiência será tratada como insubordinação.
====================================================================`;

      const blob = new Blob([cvText], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Dossie_Tatico_Major_Mota.txt";
      link.click();

      showTacticalAlert("DOWNLOAD CONCLUÍDO", "O Dossiê Tático (CV) foi transferido para o seu dispositivo.");
    });
  }

  // 7. MODAL DE CONTATO / TRANSMISSÃO MULTICANAL (WhatsApp, Telegram, E-mail, Discord)
  const contactModal = document.getElementById("modal-ordem") || document.getElementById("contact-modal");
  const openContactBtns = document.querySelectorAll(".btn-open-contact");
  const closeContactBtn = document.getElementById("close-ordem-btn") || document.getElementById("contact-close-btn");
  const contactForm = document.getElementById("form-ordem") || document.getElementById("contact-form");

  openContactBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (contactModal) contactModal.classList.remove("hidden");
    });
  });

  if (closeContactBtn) {
    closeContactBtn.addEventListener("click", () => {
      if (contactModal) contactModal.classList.add("hidden");
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const autoridadeInput = document.getElementById("autoridade") || document.getElementById("contact-name");
      const canalInput = document.getElementById("canal");
      const contatoInput = document.getElementById("contato-remetente");
      const mensagemInput = document.getElementById("mensagem");

      const autoridade = autoridadeInput ? autoridadeInput.value : "Comandante";
      const canal = canalInput ? canalInput.value : "whatsapp";
      const contatoRemetente = contatoInput ? contatoInput.value : "Não informado";
      const mensagem = mensagemInput ? mensagemInput.value : "";

      // ⚙️ PREENCHA COM OS SEUS DADOS REAIS ABAIXO:
      const meusDados = {
        whatsapp: '5513991956321',         // Ex: Código do país + DDD + Número (ex: 5513999999999)
        telegram: 'MotaChaff',           // Ex: seu usuário do Telegram (sem o @)
        email: 'miguelbrmotta@gmail.com',    // Ex: seu e-mail de recebimento
        discordProfile: 'https://discord.com/users/1329137760996425809' // Link do seu perfil ou ID do Discord
      };

      const textoMensagem = ` *NOVA ORDEM DE SERVIÇO - HQ IMPERIAL* \n\n` +
                            ` *Autoridade:* ${autoridade}\n` +
                            ` *Canal Escolhido:* ${canal.toUpperCase()}\n` +
                            ` *Contato de Retorno:* ${contatoRemetente}\n\n` +
                            ` *Diretrizes da Missão:*\n${mensagem}`;

      if (canal === 'whatsapp') {
        const url = `https://wa.me/${meusDados.whatsapp}?text=${encodeURIComponent(textoMensagem)}`;
        window.open(url, '_blank');
      } 
      else if (canal === 'telegram') {
        const url = `https://t.me/${meusDados.telegram}?text=${encodeURIComponent(textoMensagem)}`;
        window.open(url, '_blank');
      } 
      else if (canal === 'email') {
        const subject = encodeURIComponent(`⚡ Ordem de Serviço de ${autoridade} (HQ Imperial)`);
        const body = encodeURIComponent(`Autoridade: ${autoridade}\nContato de Retorno: ${contatoRemetente}\n\nDiretrizes da Missão:\n${mensagem}`);
        const url = `mailto:${meusDados.email}?subject=${subject}&body=${body}`;
        window.open(url, '_blank');
      } 
      else if (canal === 'discord') {
        navigator.clipboard.writeText(textoMensagem).then(() => {
          alert('📋 Diretrizes copiadas para a área de transferência! Cole no chat do Discord.');
          window.open(meusDados.discordProfile, '_blank');
        }).catch(() => {
          window.open(meusDados.discordProfile, '_blank');
        });
      }

      if (contactModal) contactModal.classList.add("hidden");
      contactForm.reset();
      showTacticalAlert("TRANSMISSÃO ENVIADA", `Ordem de serviço de [${autoridade}] redirecionada com sucesso.`);
    });
  }

  // 8. INTERAÇÕES COM DIPLOMAS E WIDGET DE MANA
  const diplomas = document.querySelectorAll(".diploma-item");
  diplomas.forEach(diploma => {
    diploma.addEventListener("click", () => {
      const title = diploma.querySelector("h4").textContent;
      showTacticalAlert("CREDÊNCIAL VERIFICADA", `Credencial militar legítima: "${title}". Verificação efetuada via blockchain HQ.`);
    });
  });

  const skillWidget = document.getElementById("skills");
  const skillBar = document.getElementById("skill-bar");
  const skillCounter = document.getElementById("skill-counter");

  if (skillWidget && skillBar && skillCounter) {
    skillWidget.addEventListener("click", () => {
      skillBar.style.width = "100%";
      skillCounter.innerHTML = `100 <span class="text-xs font-normal text-[#8a9a8a]">/ 100</span>`;
      showTacticalAlert("SOBRECARGA DE MANA", "Capacidade do Módulo de Mana elevada ao máximo (100%)!");
    });
  }
});