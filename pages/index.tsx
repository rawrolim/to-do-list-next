import axios from 'axios';
import { useEffect, useState } from 'react'
import itemModel from '../models/itemModel';
import { FaArrowUp, FaCheck, FaCommentDots, FaEllipsisV, FaPause, FaPlay, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import Head from 'next/head';
import moment from 'moment';

export default function Home() {
  const [deadline, setDeadline] = useState("");
  const [stop, setStop] = useState(false);
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [tempoMinutos, setTempoMinutos] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("-");
  const [comentario, setComentario] = useState("");
  const [lista, setLista] = useState<itemModel[]>([]);
  const [itemApontando, setItemApontando] = useState<itemModel>();
  const [itemComentario, setItemComentario] = useState<itemModel>();

  useEffect(() => {
    const interval = setInterval(() => {
      getTime(deadline, stop);
    }, 1000);

    getLista();

    return () => clearInterval(interval);
  }, [deadline, stop]);

  const getTime = (deadline: any, stop: boolean) => {
    if (deadline !== "" && stop === false) {
      const time = Date.now() - Date.parse(deadline);
      const diferenca_tempo_segundos = Math.floor((time / 1000));
      if (itemApontando !== undefined) {
        lista.map(item => {
          if (item._id === itemApontando._id) {
            item.tempo = time;
          }
        });
      }
      setTempoSegundos(getSegundos(time));
      setTempoMinutos(getMinutos((time)));
      updateTempo(diferenca_tempo_segundos);
    }
  };

  const comecar = (item: itemModel) => {
    setStop(false);
    setTempoSegundos(getSegundos(item.tempo));
    setTempoMinutos(getMinutos(item.tempo));

    if (item.tempo > 0) {
      const deadline_aux = Date.now() - item.tempo * 1000;
      setDeadline(new Date(deadline_aux).toString());
    } else {
      setDeadline(new Date().toString());
    }
    toast.success('Item contando o tempo.');
    setItemApontando(item);
  };

  const insereCard = async () => {
    if (titulo !== '') {
      const data = {
        titulo,
        descricao
      };

      setTitulo('');

      await axios.post("/api", data);
      toast.success("Card inserido com sucesso!");
      getLista();
    } else {
      toast.error("Necessário informar o título!");
    }
  }

  const getLista = async () => {
    const res = await axios.get("/api");
    setLista(res.data);
  }

  const alteraStatus = async (item: itemModel) => {
    if (item.concluido === false) {
      if (itemApontando !== undefined) {
        if (item._id === itemApontando._id) {
          setStop(true);
          setTempoMinutos(0);
          setTempoSegundos(0);
          setItemApontando(undefined);
        }
      }
    }

    item.concluido = !item.concluido
    await axios.put('/api/' + item._id, item);
    let message = "";
    if (item.concluido === false) {
      message = "Item reaberto com sucesso.";
    } else {
      message = "Item concluído com sucesso.";
    }
    toast.success(message);
    getLista();
  }

  const updateTempo = (_tempo: number) => {
    if (itemApontando !== undefined) {
      if ((_tempo % 3) === 0) {
        itemApontando.tempo = _tempo;
        axios.put('/api/' + itemApontando._id, itemApontando);
      }
    }
  }

  const deletaItem = async (item: itemModel) => {
    setStop(true);
    setTempoMinutos(0);
    setTempoSegundos(0);
    setItemApontando(undefined);
    await axios.delete('/api/' + item._id);
    toast.success("Card deletado com sucesso!");
    getLista();
  }

  const getMinutos = (_segundos: number) => {
    return Math.floor((_segundos / 1000 / 60) % 60);
  }

  const getSegundos = (_segundos: number) => {
    return Math.floor((_segundos / 1000) % 60);
  }

  const fixarDoisDigitos = (_tempo: number) => {
    if (_tempo < 10) {
      return "0" + _tempo.toString();
    } else {
      return _tempo;
    }
  }

  const salvarComentario = async (item: itemModel) => {
    const coment = {
      texto: comentario,
      data: new Date(),
      usuario: ''
    };
    item.comentarios.push(coment);

    if (itemApontando !== undefined) {
      if (item._id === itemApontando._id) {
        itemApontando.comentarios.push(coment);
      }
    } else {
      await axios.put('/api/' + item._id, item);
    }
    setComentario("");
  }

  const imprimeListaPendente = () => {
    const listPendente = lista.filter(lista => lista.concluido === false);
    return (
      <>
        <div className='fs-4 text-uppercase'>Itens pendentes</div>
        <ul className='list-group list-group-flush'>
          {listPendente && listPendente.map(item => {
            return (
              <li key={item._id} className='list-group-item text-white text-uppercase d-flex' style={{ backgroundColor: 'rgb(37, 37, 37)' }}>
                <div className='align-self-center col-8'>
                  {item.titulo}
                </div>
                <div className='align-self-center col'>
                  {itemApontando?._id === item._id ?
                    <>
                      {fixarDoisDigitos(tempoMinutos)}
                      :
                      {fixarDoisDigitos(tempoSegundos)}
                    </>
                    :
                    <>
                      {fixarDoisDigitos(Math.floor((item.tempo / 60) % 60))}
                      :
                      {fixarDoisDigitos(Math.floor((item.tempo) % 60))}
                    </>
                  }
                </div>
                <div className='align-self-center col-2'>
                  {itemApontando?._id === item._id ?
                    <div className='apontando'>
                      Apontando
                    </div>
                    : null
                  }
                </div>
                <div className='align-self-center col-1 text-center dropdown-toggle-split drop' data-bs-toggle="dropdown" aria-expanded="false">
                  <FaEllipsisV size={20} />
                </div>
                <ul className="dropdown-menu text-center">
                  <li className='dropdown-item border-bottom' style={{ cursor: 'pointer' }} onClick={() => comecar(item)}>Começar</li>
                  <li className='dropdown-item border-bottom' style={{ cursor: 'pointer' }} onClick={() => setStop(true)}>Parar</li>
                  <li className='dropdown-item border-bottom' style={{ cursor: 'pointer' }} onClick={() => alteraStatus(item)}>Concluir</li>
                  <li className='dropdown-item border-bottom' style={{ cursor: 'pointer' }} onClick={() => deletaItem(item)}>Deletar</li>
                  <li className='dropdown-item' style={{ cursor: 'pointer' }} onClick={() => setItemComentario(item)} data-bs-toggle="modal" data-bs-target="#exampleModal">Comentários</li>
                </ul>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  const imprimeListaConcluido = () => {
    const listPendente = lista.filter(lista => lista.concluido === true);
    return (
      <>
        <div className='fs-4 text-uppercase'>Itens Concluídos</div>
        <ul className='list-group list-group-flush'>
          {listPendente && listPendente.map(item => {
            return (
              <li key={item._id} className='list-group-item text-white text-uppercase d-flex' style={{ backgroundColor: 'rgb(37, 37, 37)' }}>
                <div className='align-self-center col'>
                  {item.titulo}
                </div>
                <div className='align-self-center col-1'>
                  {fixarDoisDigitos(Math.floor((item.tempo / 60) % 60))}
                  :
                  {fixarDoisDigitos(Math.floor((item.tempo) % 60))}
                </div>
                <div className='align-self-center col-2 text-center' style={{ cursor: 'pointer' }} onClick={() => { alteraStatus(item) }}>
                  <FaArrowUp size={20} />
                </div>
                <div className='align-self-center col-1 text-center' style={{ cursor: 'pointer' }} onClick={() => setItemComentario(item)} data-bs-toggle="modal" data-bs-target="#exampleModal">
                  <FaCommentDots size={20} />
                </div>
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <div className='conteiner p-1'>
      <Head >
        <title>Contador de tempo</title>
      </Head>
      <ToastContainer />
      {itemApontando !== undefined ?
        <div className='d-flex flex-wrap p-0 m-0 justify-content-center'>
          <div className='shadow-danger justify-content-center d-flex rounded-circle btn-danger btn' onClick={() => { deletaItem(itemApontando) }} style={{ height: '60px', width: '60px', cursor: 'pointer', marginTop: '170px' }}>
            <FaTrash size={20} className='align-self-center' />
          </div>
          <div className='shadow-primary btn-primary btn rounded-circle col-1 d-flex' style={{ height: '90px', width: '90px', cursor: 'pointer', marginTop: '140px' }} onClick={() => { comecar(itemApontando) }}>
            <FaPlay size={30} className='align-self-center col-12' />
          </div>
          <div className='justify-content-center d-flex mt-5'>
            <div className='shadow-light rounded-circle bg-white text-dark p-0 d-flex' style={{ height: '180px', width: '180px', fontSize: '56px' }}>
              <div className='p-0 text-center align-self-center col-12'>
                {fixarDoisDigitos(tempoMinutos)}:{fixarDoisDigitos(tempoSegundos)}
              </div>
            </div>
          </div>
          <div className='shadow-primary btn-primary btn rounded-circle d-flex col-1' style={{ height: '90px', width: '90px', cursor: 'pointer', marginTop: '140px' }} onClick={() => { setStop(true) }}>
            <FaPause size={20} className='align-self-center col-12' />
          </div>
          <div className='shadow-success justify-content-center d-flex rounded-circle btn-success btn' onClick={() => { alteraStatus(itemApontando) }} style={{ height: '60px', width: '60px', cursor: 'pointer', marginTop: '170px' }}>
            <FaCheck size={20} className='align-self-center' />
          </div>
        </div>
        : null
      }
      <div className='col-12 mt-5 input-group'>
        <div className='col'>
          <input type='text' className='rounded-0 form-control' placeholder='Título da ação' value={titulo} onChange={e => setTitulo(e.target.value)} />
        </div>
        <button className='btn btn-outline-light rounded-0' onClick={insereCard}>Adicionar</button>
      </div>
      <br />
      {imprimeListaPendente()}
      <hr />
      {imprimeListaConcluido()}

      <div className="modal fade" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-dark" id="exampleModalLabel">Comentários</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body pb-0">
              {itemComentario !== undefined ?
                <>
                  <ul className='list-group list-group-flush overflow-auto' style={{ maxHeight: '400px' }}>
                    {itemComentario.comentarios && itemComentario.comentarios.map(comentario => {
                      return (
                        <li className='text-dark d-flex text-wrap list-group-item'>
                          <div className='col-8'>{comentario.texto}</div>
                          <div className='col align-self-center'>{moment(comentario.data).format("DD/MM/YYYY HH:mm")}</div>
                        </li>
                      )
                    })}
                  </ul>
                </>
                : null}
              <hr />

            </div>
            {itemComentario !== undefined ?
              itemComentario.concluido === false ?
                <div className='modal-footer'>
                  <div className='input-group'>
                    <input className='form-control' value={comentario} placeholder="Insira um comentário" onChange={e => setComentario(e.target.value)} />
                    <button className='btn btn-primary' onClick={() => salvarComentario(itemComentario)}>Enviar</button>
                  </div>
                </div>
                : null
              : null}
          </div>
        </div>
      </div>


    </div>
  )
}
